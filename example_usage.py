#!/usr/bin/env python3
"""
Prometheus P95 메트릭 조회 예제

실제 사용 사례를 보여주는 예제 스크립트입니다.
"""

from query_p95_metrics import PrometheusP95Query
import json


def example_basic_p95():
    """기본 P95 조회 예제"""
    print("\n" + "="*60)
    print("예제 1: 기본 P95 레이턴시 조회")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    results = prom.query_p95_by_model(
        metric_name="request_duration_seconds",
        time_range="5m"
    )
    
    prom.format_results(results)


def example_multiple_percentiles():
    """여러 백분위수 조회 예제"""
    print("\n" + "="*60)
    print("예제 2: P50, P95, P99 동시 조회")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    results = prom.query_multiple_percentiles(
        metric_name="request_duration_seconds",
        percentiles=[0.50, 0.95, 0.99],
        time_range="5m"
    )
    
    for percentile, result in results.items():
        prom.format_results(result, percentile)


def example_time_series():
    """시계열 데이터 조회 예제"""
    print("\n" + "="*60)
    print("예제 3: 1시간 동안의 P95 추이")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    results = prom.query_p95_range_by_model(
        metric_name="request_duration_seconds",
        duration="1h",
        step="5m"
    )
    
    prom.format_results(results)


def example_custom_metric():
    """커스텀 메트릭 조회 예제"""
    print("\n" + "="*60)
    print("예제 4: 커스텀 메트릭 조회")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    # API 응답 시간 메트릭
    results = prom.query_p95_by_model(
        metric_name="api_response_time_seconds",
        time_range="10m",
        model_label="model_name"
    )
    
    prom.format_results(results)


def example_json_output():
    """JSON 출력 예제"""
    print("\n" + "="*60)
    print("예제 5: JSON 형식으로 출력")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    results = prom.query_p95_by_model(
        metric_name="request_duration_seconds",
        time_range="5m"
    )
    
    # JSON으로 출력
    print(json.dumps(results, indent=2))


def example_monitoring_dashboard():
    """모니터링 대시보드 시뮬레이션"""
    print("\n" + "="*60)
    print("예제 6: 실시간 모니터링 대시보드")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    # P95 조회
    p95_results = prom.query_p95_by_model(
        metric_name="request_duration_seconds",
        time_range="5m"
    )
    
    if p95_results.get('status') == 'success':
        data = p95_results.get('data', {}).get('result', [])
        
        print("\n🎯 모델 성능 대시보드")
        print("-" * 60)
        
        for item in data:
            model = item['metric'].get('model', 'Unknown')
            value_ms = float(item['value'][1]) * 1000
            
            # 성능 상태 판단
            if value_ms < 100:
                status = "✅ 양호"
            elif value_ms < 200:
                status = "⚠️  주의"
            else:
                status = "🚨 위험"
            
            print(f"{model:20s} | P95: {value_ms:7.2f}ms | {status}")
        
        print("-" * 60)


def example_alert_threshold():
    """임계값 기반 알림 예제"""
    print("\n" + "="*60)
    print("예제 7: SLA 임계값 체크")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    # SLA 임계값 (밀리초)
    SLA_THRESHOLD_MS = 200
    
    results = prom.query_p95_by_model(
        metric_name="request_duration_seconds",
        time_range="5m"
    )
    
    if results.get('status') == 'success':
        data = results.get('data', {}).get('result', [])
        
        violations = []
        
        for item in data:
            model = item['metric'].get('model', 'Unknown')
            value_ms = float(item['value'][1]) * 1000
            
            if value_ms > SLA_THRESHOLD_MS:
                violations.append({
                    'model': model,
                    'p95_ms': value_ms,
                    'threshold_ms': SLA_THRESHOLD_MS,
                    'violation_pct': ((value_ms - SLA_THRESHOLD_MS) / SLA_THRESHOLD_MS) * 100
                })
        
        if violations:
            print("\n⚠️  SLA 위반 감지!")
            print("-" * 60)
            for v in violations:
                print(f"🚨 모델: {v['model']}")
                print(f"   P95: {v['p95_ms']:.2f}ms (임계값: {v['threshold_ms']}ms)")
                print(f"   초과율: {v['violation_pct']:.1f}%")
                print()
        else:
            print("\n✅ 모든 모델이 SLA를 준수하고 있습니다!")


def example_comparison():
    """모델 간 성능 비교 예제"""
    print("\n" + "="*60)
    print("예제 8: 모델 간 성능 비교")
    print("="*60)
    
    prom = PrometheusP95Query("http://localhost:9090")
    
    results = prom.query_multiple_percentiles(
        metric_name="request_duration_seconds",
        percentiles=[0.50, 0.95, 0.99],
        time_range="5m"
    )
    
    # 모델별로 데이터 재구성
    model_stats = {}
    
    for percentile, result in results.items():
        if result.get('status') == 'success':
            data = result.get('data', {}).get('result', [])
            
            for item in data:
                model = item['metric'].get('model', 'Unknown')
                value_ms = float(item['value'][1]) * 1000
                
                if model not in model_stats:
                    model_stats[model] = {}
                
                model_stats[model][f'p{int(percentile*100)}'] = value_ms
    
    # 비교 테이블 출력
    print("\n📊 모델별 레이턴시 비교")
    print("-" * 80)
    print(f"{'모델':<20} | {'P50':>10} | {'P95':>10} | {'P99':>10} | {'P50-P95 차이':>15}")
    print("-" * 80)
    
    for model, stats in sorted(model_stats.items()):
        p50 = stats.get('p50', 0)
        p95 = stats.get('p95', 0)
        p99 = stats.get('p99', 0)
        diff = p95 - p50
        
        print(f"{model:<20} | {p50:>9.2f}ms | {p95:>9.2f}ms | {p99:>9.2f}ms | {diff:>14.2f}ms")
    
    print("-" * 80)


def main():
    """모든 예제 실행"""
    
    print("\n" + "🚀 Prometheus P95 메트릭 조회 예제 모음")
    print("=" * 60)
    print("\n⚠️  참고: 이 예제들은 http://localhost:9090 에서 실행 중인")
    print("   Prometheus 서버가 필요합니다.\n")
    
    examples = [
        ("기본 P95 조회", example_basic_p95),
        ("여러 백분위수 조회", example_multiple_percentiles),
        ("시계열 데이터 조회", example_time_series),
        ("커스텀 메트릭 조회", example_custom_metric),
        ("JSON 출력", example_json_output),
        ("모니터링 대시보드", example_monitoring_dashboard),
        ("SLA 임계값 체크", example_alert_threshold),
        ("모델 성능 비교", example_comparison),
    ]
    
    print("사용 가능한 예제:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")
    
    print("\n모든 예제를 실행하려면 Enter를 누르세요.")
    print("특정 예제만 실행하려면 번호를 입력하세요 (예: 1,3,5):")
    
    user_input = input("> ").strip()
    
    if user_input:
        # 특정 예제만 실행
        try:
            indices = [int(x.strip()) for x in user_input.split(',')]
            for idx in indices:
                if 1 <= idx <= len(examples):
                    name, func = examples[idx - 1]
                    try:
                        func()
                    except Exception as e:
                        print(f"\n❌ 예제 실행 중 오류 발생: {e}")
        except ValueError:
            print("❌ 잘못된 입력입니다.")
    else:
        # 모든 예제 실행
        for name, func in examples:
            try:
                func()
            except Exception as e:
                print(f"\n❌ '{name}' 예제 실행 중 오류 발생: {e}")
    
    print("\n" + "="*60)
    print("✅ 예제 실행 완료!")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
