import os
from app import create_app

app = create_app(os.getenv('FLASK_CONFIG') or 'default')

if __name__ == '__main__':
    print("=" * 80)
    print("자산관리 시스템 서버를 시작합니다...")
    print("* 데이터베이스는 미구현 상태이며 하드코딩된 데이터를 사용합니다.")
    print("* 모든 계정의 비밀번호는 'password'입니다.")
    print("* 포트: 5200")
    print("=" * 80)
    app.run(debug=True, port=5200) 