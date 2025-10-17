#!/usr/bin/env python3
"""
Django API 테스트 스크립트

서버가 실행 중이어야 합니다:
    python3 manage.py runserver
"""

import requests
import json
from typing import Dict, Any


class APITester:
    """Django API 테스트 클래스"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
    
    def test_p95_metrics(self) -> Dict[str, Any]:
        """P95 메트릭 조회 테스트"""
        print("\n" + "="*60)
        print("테스트 1: 모델별 P95 메트릭 조회")
        print("="*60)
        
        endpoint = f"{self.api_url}/metrics/p95/"
        params = {
            'time_range': '5m',
            'metric_name': 'request_duration_seconds'
        }
        
        try:
            response = requests.get(endpoint, params=params)
            print(f"✅ 상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 응답 데이터:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                return data
            else:
                print(f"❌ 에러: {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ 예외 발생: {e}")
            return {}
    
    def test_p95_range_metrics(self) -> Dict[str, Any]:
        """P95 범위 메트릭 조회 테스트"""
        print("\n" + "="*60)
        print("테스트 2: 시간 범위 동안의 P95 메트릭 조회")
        print("="*60)
        
        endpoint = f"{self.api_url}/metrics/p95/range/"
        params = {
            'duration': '1h',
            'step': '5m',
            'metric_name': 'request_duration_seconds'
        }
        
        try:
            response = requests.get(endpoint, params=params)
            print(f"✅ 상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 응답 데이터:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                return data
            else:
                print(f"❌ 에러: {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ 예외 발생: {e}")
            return {}
    
    def test_multiple_percentiles(self) -> Dict[str, Any]:
        """여러 백분위수 조회 테스트"""
        print("\n" + "="*60)
        print("테스트 3: 여러 백분위수 조회")
        print("="*60)
        
        endpoint = f"{self.api_url}/metrics/percentiles/"
        params = {
            'percentiles': '50,95,99',
            'time_range': '5m',
            'metric_name': 'request_duration_seconds'
        }
        
        try:
            response = requests.get(endpoint, params=params)
            print(f"✅ 상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 응답 데이터:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                return data
            else:
                print(f"❌ 에러: {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ 예외 발생: {e}")
            return {}
    
    def test_server_connection(self) -> bool:
        """서버 연결 테스트"""
        print("\n" + "="*60)
        print("서버 연결 확인")
        print("="*60)
        
        try:
            response = requests.get(f"{self.base_url}/api/metrics/p95/", timeout=5)
            print(f"✅ 서버가 실행 중입니다 (상태 코드: {response.status_code})")
            return True
        except requests.exceptions.ConnectionError:
            print("❌ 서버에 연결할 수 없습니다.")
            print("   서버를 먼저 실행해주세요: python3 manage.py runserver")
            return False
        except Exception as e:
            print(f"❌ 예외 발생: {e}")
            return False


def main():
    """메인 함수"""
    print("\n" + "🚀 Django Prometheus Metrics API 테스트")
    print("="*60)
    
    tester = APITester()
    
    # 서버 연결 확인
    if not tester.test_server_connection():
        print("\n⚠️  서버를 먼저 실행해주세요:")
        print("   python3 manage.py runserver")
        return
    
    # 각 엔드포인트 테스트
    tester.test_p95_metrics()
    tester.test_p95_range_metrics()
    tester.test_multiple_percentiles()
    
    print("\n" + "="*60)
    print("✅ 테스트 완료!")
    print("="*60 + "\n")
    
    print("📝 프론트엔드에서 사용하는 방법:")
    print("-"*60)
    print("""
# JavaScript Fetch API
fetch('http://localhost:8000/api/metrics/p95/')
  .then(res => res.json())
  .then(data => console.log(data));

# jQuery
$.get('http://localhost:8000/api/metrics/p95/', function(data) {
  console.log(data);
});

# Axios
axios.get('http://localhost:8000/api/metrics/p95/')
  .then(res => console.log(res.data));
    """)


if __name__ == '__main__':
    main()
