---
key: /2023/01/24/Docker-Study.html
title: Docker-Docker Study
tags: docker
---

<br><br>
# 1. Docker : 23.01.24

### 1) Docker 란?

- 작은 컴퓨터를 컨테이너로 만들어서 가상 환경에서 프로그램을 이미지로 올려서 돌릴 수 있다. 보통 서버나 DB를 돌린다. 

### 2) Docker 문법 : 

- 컨테이너 모든 목록 확인:
	- docker ps -a

- 컨테이너 실행중인 목록 확인 : 
	- docker ps


- 컨테이너 동작 : docker start (컨테이너 이름)

	- docker start oracle
	
- 컨테이너 멈춤 : docker stop  (컨테이너 이름)
 
	- docker stop oracle 

- 컨테이너 삭제 : docker rm (컨테이너 이름) 

	- docker rm oracle
	
	
- 컨테이너 이미지 확인 :
	- docker images


- 컨테이너 이미지 삭제 : 
	- docker rmi [이미지 id]

---
	
<br><br>
### 2) Colima 설정 :

- 로컬용 오라클 실행하는 방법 : 도커에 오라클을 띄우기 위해서는 도커 엔진에 Colima를 올려서 오라클 이미지를 띄우게 된다.(아키텍쳐가 다른 것을 해결해준다.)

- Colima가 메모리를 4GB 정도 차지하게 두었기 때문에 시스템 설정에서 메모리를 크게 차지한다. 그래서, 나는 강제로 종료했는데 강제로 종료하면, 실행되고 있는 Colima의 Status가 Broken으로 되어 에러가 발생한다.

- 이렇게 되면, 터미널에서 명령어를 통해 실행되었던 colima를 지우고 다시 만들어서설정해야한다. 하지만 이렇게 하려면, 지정된 경로에  oracle DB를 저장해둬야 한다. (해당 블로그의 볼륨 설정해서 컨테이너 띄우기(위치지정!!) 참고!) 

```
colima delete
colima start --memory 4 --arch x86_64
colima list // colima가 되었는지 확인하자 
```

<br>
- 지정된 경로에 볼륨을 설정해서 oracleDB를 저장해두었다면, colima를 먼저 실행하고  해당 경로로 이동해서 기존의 docker도 지우고 다시 docker를 생성해서 docker start 명령어로 실행하자!(해당 블로그의 볼륨 설정해서 컨테이너 띄우기(위치지정!!)처음부터 다시!!)

```
cd ~/temp				// oracledb 파일이 있는 저장된 경로로 이동  
tree oracledb			// 해당 파일의 구조 확인 

docker ps -a				// 도커의 모든 컨테이너 확인
docker stop oracle		// 컨테이너 멈추고
docker ps -a				// 도커의 모든 컨테이너 확인

docker rm oracle			// 컨테이너 삭제하고
docker ps -a				// 도커의 모든 컨테이너 확인

docker start oracle		// temp 폴더에서 docker start 명령어로 저장되었던 oracle 컨테이너를 실행한다.
docker ps -a				// 도커의 모든 컨테이너 확인 
```

---

<br>
- 이렇게 까지 했는데도 에러가 발생해서 처음부터 다시 해주어야 한다. 

- 즉, colima 에러 발생으로 colima를 지우고 다시 깔면, colima부터 docker까지 처음부터 다시 설정해줘야 한다. (추가적으로 볼륨 설정을 위해서도 비밀번호 설정까지 다시 해주어야 한다. )

- 결론 : Colima는 강제종료 하지말고 docker stop으로 먼저 끄고 colima stop으로 colima 끄고 종료한다! 킬때는 colima start로 켜주고 docker를 켜주자! (순서 중요!!) **


---

<br><br>
- 로컬용 오라클db 서버 끄고 키는 방법 :

	- docker에서 db 서버가 켜져있는 경우의 명령어 순서 : 

```
- DB 서버 끄는 방법 : 
0) cd temp
1) docker stop oracle
2) colima stop

- DB 서버 키는 방법 :
0) cd temp
1) colima start
2) docker start oracle
3) docker logs -f oracle
4) DBeaver에 들어가서 DB 서버가 켜지는 들어가서 확인하기
```
	
	
	