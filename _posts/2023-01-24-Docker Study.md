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
	
	
	
	
	
	
	
	