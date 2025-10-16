#!/usr/bin/env python3
"""
Prometheus 모델별 P95 메트릭 조회 스크립트

이 스크립트는 Prometheus에서 AI 모델별 P95 레이턴시 메트릭을 조회합니다.
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import argparse


class PrometheusP95Query:
    """Prometheus에서 모델별 P95 메트릭을 조회하는 클래스"""
    
    def __init__(self, prometheus_url: str):
        """
        Args:
            prometheus_url: Prometheus 서버 URL (예: http://localhost:9090)
        """
        self.prometheus_url = prometheus_url.rstrip('/')
        self.api_url = f"{self.prometheus_url}/api/v1"
    
    def query_p95_by_model(
        self, 
        metric_name: str = "request_duration_seconds",
        time_range: str = "5m",
        model_label: str = "model"
    ) -> Dict:
        """
        모델별 P95 메트릭을 조회합니다.
        
        Args:
            metric_name: 조회할 메트릭 이름
            time_range: 시간 범위 (예: 5m, 1h, 24h)
            model_label: 모델을 구분하는 레이블 이름
            
        Returns:
            모델별 P95 값을 담은 딕셔너리
        """
        # PromQL 쿼리: 모델별로 P95 계산
        query = f'histogram_quantile(0.95, sum(rate({metric_name}_bucket{{job="api"}}[{time_range}])) by (le, {model_label}))'
        
        params = {
            'query': query
        }
        
        try:
            response = requests.get(
                f"{self.api_url}/query",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ 프로메테우스 쿼리 실패: {e}")
            return {}
    
    def query_p95_range_by_model(
        self,
        metric_name: str = "request_duration_seconds",
        duration: str = "1h",
        step: str = "1m",
        model_label: str = "model"
    ) -> Dict:
        """
        시간 범위 동안의 모델별 P95 메트릭을 조회합니다.
        
        Args:
            metric_name: 조회할 메트릭 이름
            duration: 조회할 시간 길이 (예: 1h, 6h, 24h)
            step: 데이터 포인트 간격 (예: 1m, 5m)
            model_label: 모델을 구분하는 레이블 이름
            
        Returns:
            시간별 모델별 P95 값을 담은 딕셔너리
        """
        # 종료 시간은 현재, 시작 시간은 duration만큼 이전
        end_time = datetime.now()
        
        # duration 파싱 (간단한 구현)
        duration_seconds = self._parse_duration(duration)
        start_time = end_time - timedelta(seconds=duration_seconds)
        
        query = f'histogram_quantile(0.95, sum(rate({metric_name}_bucket{{job="api"}}[5m])) by (le, {model_label}))'
        
        params = {
            'query': query,
            'start': start_time.timestamp(),
            'end': end_time.timestamp(),
            'step': step
        }
        
        try:
            response = requests.get(
                f"{self.api_url}/query_range",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ 프로메테우스 range 쿼리 실패: {e}")
            return {}
    
    def query_multiple_percentiles(
        self,
        metric_name: str = "request_duration_seconds",
        percentiles: List[float] = [0.50, 0.95, 0.99],
        time_range: str = "5m",
        model_label: str = "model"
    ) -> Dict[float, Dict]:
        """
        여러 백분위수를 한 번에 조회합니다.
        
        Args:
            metric_name: 조회할 메트릭 이름
            percentiles: 조회할 백분위수 리스트 (0.0 ~ 1.0)
            time_range: 시간 범위
            model_label: 모델을 구분하는 레이블 이름
            
        Returns:
            백분위수별 결과를 담은 딕셔너리
        """
        results = {}
        
        for percentile in percentiles:
            query = f'histogram_quantile({percentile}, sum(rate({metric_name}_bucket{{job="api"}}[{time_range}])) by (le, {model_label}))'
            
            params = {'query': query}
            
            try:
                response = requests.get(
                    f"{self.api_url}/query",
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                results[percentile] = response.json()
            except requests.exceptions.RequestException as e:
                print(f"❌ P{int(percentile*100)} 쿼리 실패: {e}")
                results[percentile] = {}
        
        return results
    
    def _parse_duration(self, duration: str) -> int:
        """
        duration 문자열을 초 단위로 변환합니다.
        
        Args:
            duration: 시간 문자열 (예: 5m, 1h, 24h)
            
        Returns:
            초 단위 시간
        """
        unit = duration[-1]
        value = int(duration[:-1])
        
        multipliers = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400
        }
        
        return value * multipliers.get(unit, 60)
    
    def format_results(self, results: Dict, percentile: float = 0.95) -> None:
        """
        쿼리 결과를 포맷하여 출력합니다.
        
        Args:
            results: Prometheus API 응답
            percentile: 백분위수 (출력용)
        """
        if not results or results.get('status') != 'success':
            print("❌ 유효한 결과가 없습니다.")
            return
        
        data = results.get('data', {})
        result_type = data.get('resultType')
        result = data.get('result', [])
        
        if not result:
            print("📊 데이터가 없습니다.")
            return
        
        print(f"\n{'='*60}")
        print(f"📊 모델별 P{int(percentile*100)} 레이턴시 메트릭")
        print(f"{'='*60}\n")
        
        # 결과를 값 기준으로 정렬
        sorted_results = sorted(
            result,
            key=lambda x: float(x.get('value', [0, 0])[1]) if result_type == 'vector' else 0,
            reverse=True
        )
        
        for item in sorted_results:
            metric = item.get('metric', {})
            model_name = metric.get('model', 'Unknown')
            
            if result_type == 'vector':
                # 단일 시점 쿼리
                timestamp, value = item.get('value', [0, 0])
                value_ms = float(value) * 1000  # 초를 밀리초로 변환
                print(f"🤖 모델: {model_name:20s} → P{int(percentile*100)}: {value_ms:8.2f}ms")
            
            elif result_type == 'matrix':
                # 시계열 쿼리
                values = item.get('values', [])
                if values:
                    # 최근 값 표시
                    latest_timestamp, latest_value = values[-1]
                    value_ms = float(latest_value) * 1000
                    print(f"🤖 모델: {model_name:20s} → 최근 P{int(percentile*100)}: {value_ms:8.2f}ms (데이터 포인트: {len(values)}개)")
        
        print(f"\n{'='*60}\n")


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(
        description='Prometheus에서 모델별 P95 메트릭 조회',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  # 기본 P95 조회
  python query_p95_metrics.py --url http://localhost:9090
  
  # 특정 메트릭 조회
  python query_p95_metrics.py --url http://localhost:9090 --metric api_latency_seconds
  
  # 시간 범위 지정
  python query_p95_metrics.py --url http://localhost:9090 --range 1h --step 5m
  
  # 여러 백분위수 조회
  python query_p95_metrics.py --url http://localhost:9090 --percentiles 50 95 99
        """
    )
    
    parser.add_argument(
        '--url',
        default='http://localhost:9090',
        help='Prometheus 서버 URL (기본값: http://localhost:9090)'
    )
    
    parser.add_argument(
        '--metric',
        default='request_duration_seconds',
        help='메트릭 이름 (기본값: request_duration_seconds)'
    )
    
    parser.add_argument(
        '--time-range',
        default='5m',
        help='시간 범위 (기본값: 5m)'
    )
    
    parser.add_argument(
        '--range',
        dest='duration',
        help='range 쿼리 시 조회할 기간 (예: 1h, 6h, 24h)'
    )
    
    parser.add_argument(
        '--step',
        default='1m',
        help='range 쿼리 시 스텝 간격 (기본값: 1m)'
    )
    
    parser.add_argument(
        '--model-label',
        default='model',
        help='모델 레이블 이름 (기본값: model)'
    )
    
    parser.add_argument(
        '--percentiles',
        type=int,
        nargs='+',
        help='조회할 백분위수 (예: 50 95 99)'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='JSON 형식으로 출력'
    )
    
    args = parser.parse_args()
    
    # PrometheusP95Query 인스턴스 생성
    prom_query = PrometheusP95Query(args.url)
    
    # 여러 백분위수 조회
    if args.percentiles:
        percentiles = [p / 100 for p in args.percentiles]
        results = prom_query.query_multiple_percentiles(
            metric_name=args.metric,
            percentiles=percentiles,
            time_range=args.time_range,
            model_label=args.model_label
        )
        
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for percentile, result in results.items():
                prom_query.format_results(result, percentile)
    
    # Range 쿼리
    elif args.duration:
        results = prom_query.query_p95_range_by_model(
            metric_name=args.metric,
            duration=args.duration,
            step=args.step,
            model_label=args.model_label
        )
        
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            prom_query.format_results(results)
    
    # 기본 instant 쿼리
    else:
        results = prom_query.query_p95_by_model(
            metric_name=args.metric,
            time_range=args.time_range,
            model_label=args.model_label
        )
        
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            prom_query.format_results(results)


if __name__ == '__main__':
    main()
