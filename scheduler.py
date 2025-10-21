#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Newsletter Agent Scheduler
정기적으로 뉴스레터를 자동 생성하는 스케줄러
"""

import os
import sys
import yaml
import time
import schedule
from datetime import datetime
from pathlib import Path

# newsletter_agent import
from newsletter_agent import NewsletterAgent


def load_config(config_path: str = "newsletter_agent_config.yaml"):
    """설정 로드"""
    if not os.path.exists(config_path):
        print(f"⚠️  설정 파일을 찾을 수 없습니다: {config_path}")
        return {}
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def send_notification(message: str, config: dict):
    """알림 전송"""
    if not config.get('notifications', {}).get('enabled'):
        return
    
    # Slack 알림
    slack_webhook = config.get('notifications', {}).get('slack_webhook')
    if slack_webhook:
        try:
            import requests
            requests.post(slack_webhook, json={'text': message})
        except Exception as e:
            print(f"⚠️  Slack 알림 전송 실패: {e}")
    
    # 이메일 알림 (추가 구현 가능)
    # email = config.get('notifications', {}).get('email')
    # if email:
    #     # 이메일 전송 로직


def run_newsletter_job(config_path: str = "newsletter_agent_config.yaml"):
    """뉴스레터 생성 작업 실행"""
    print("\n" + "=" * 80)
    print(f"🤖 뉴스레터 자동 생성 작업 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    try:
        # 설정 로드
        config = load_config(config_path)
        
        # 에이전트 생성 및 실행
        agent = NewsletterAgent(config_path)
        file_path = agent.auto_generate_newsletter()
        
        if file_path:
            message = f"✅ 뉴스레터 생성 완료: {file_path}"
            print(f"\n{message}")
            send_notification(message, config)
        else:
            message = "⚠️  뉴스레터 생성 실패 (후보 포스트 없음)"
            print(f"\n{message}")
            send_notification(message, config)
    
    except Exception as e:
        message = f"❌ 뉴스레터 생성 오류: {e}"
        print(f"\n{message}")
        send_notification(message, config)
    
    print("=" * 80 + "\n")


def setup_schedule(cron_expr: str, timezone: str = "UTC"):
    """
    스케줄 설정
    
    Args:
        cron_expr: cron 표현식 (예: "0 9 * * 1" = 매주 월요일 오전 9시)
        timezone: 타임존
    """
    # cron 표현식 파싱 (간단한 버전)
    # 형식: "분 시 일 월 요일"
    parts = cron_expr.split()
    if len(parts) != 5:
        print(f"⚠️  잘못된 cron 표현식: {cron_expr}")
        return
    
    minute, hour, day, month, weekday = parts
    
    # 요일별 스케줄 (0=일요일, 6=토요일)
    weekday_map = {
        '0': schedule.every().sunday,
        '1': schedule.every().monday,
        '2': schedule.every().tuesday,
        '3': schedule.every().wednesday,
        '4': schedule.every().thursday,
        '5': schedule.every().friday,
        '6': schedule.every().saturday,
    }
    
    time_str = f"{hour.zfill(2)}:{minute.zfill(2)}"
    
    if weekday in weekday_map and weekday != '*':
        # 특정 요일
        weekday_map[weekday].at(time_str).do(run_newsletter_job)
        print(f"📅 스케줄 등록: 매주 {weekday}요일 {time_str}")
    elif day != '*':
        # 매월 특정일
        schedule.every().day.at(time_str).do(run_newsletter_job)
        print(f"📅 스케줄 등록: 매일 {time_str}")
    else:
        # 매일
        schedule.every().day.at(time_str).do(run_newsletter_job)
        print(f"📅 스케줄 등록: 매일 {time_str}")


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='뉴스레터 자동 생성 스케줄러'
    )
    parser.add_argument(
        '--config',
        default='newsletter_agent_config.yaml',
        help='설정 파일 경로'
    )
    parser.add_argument(
        '--once',
        action='store_true',
        help='한 번만 실행 (스케줄 없이)'
    )
    parser.add_argument(
        '--daemon',
        action='store_true',
        help='데몬 모드로 실행 (백그라운드)'
    )
    
    args = parser.parse_args()
    
    # 설정 로드
    config = load_config(args.config)
    
    if args.once:
        # 한 번만 실행
        run_newsletter_job(args.config)
        return
    
    # 스케줄 설정
    schedule_config = config.get('schedule', {})
    
    if not schedule_config.get('enabled'):
        print("⚠️  스케줄이 비활성화되어 있습니다.")
        print("   newsletter_agent_config.yaml에서 schedule.enabled를 true로 설정하세요.")
        return
    
    cron_expr = schedule_config.get('cron', '0 9 * * 1')
    timezone = schedule_config.get('timezone', 'UTC')
    
    print("=" * 80)
    print("🤖 뉴스레터 자동 생성 스케줄러 시작")
    print("=" * 80)
    print(f"설정 파일: {args.config}")
    print(f"Cron 표현식: {cron_expr}")
    print(f"타임존: {timezone}")
    print("=" * 80 + "\n")
    
    # 스케줄 설정
    setup_schedule(cron_expr, timezone)
    
    # 스케줄 실행
    print("⏰ 스케줄러가 실행 중입니다... (Ctrl+C로 종료)\n")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # 1분마다 체크
    except KeyboardInterrupt:
        print("\n\n👋 스케줄러를 종료합니다.")
        sys.exit(0)


if __name__ == '__main__':
    main()
