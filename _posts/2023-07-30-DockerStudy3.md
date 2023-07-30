---
key: /2023/07/30/DockerStudy3.html
title: Docker - Docker Study3
tags: docker
---


<br><br>	
	
# 1. Docker로 다중 컨테이너 애플리케이션 구축하기


### 1) 각 역할에 대한 컨테이너를 도커화하는 방법

#### a. MongoDB 이미지 도커화 

- 현재, 이 노드 API가 연결할 때, 데이터베이스와 통신하기 때문에, 데이터베이스를 포함하는 컨테이너를 가동하여 이것이 작동하려면, 이 포트 27017를 노출해야 한다.   

<br>
- 도커 컨테이너에서 로컬 머신으로 가동시켜야 한다. 우리 서비스가 로컬 머신을 통해 서비스에 연결할 수 있다. 

<br>
- MongoDB 이미지는 포트번호 27017를 노출시키고 있다.

<br>
- 통신 URL : `mongodb://localhost:27017/course-goals`

<br>
- 현재는 아직 도커화되지 않는 로컬의 NodeJS에 연결한다. 

```docker
// 몽고DB를 컨테이너에서 실행시키기
docker run --name mongodb --rm -d -p 27017:27017 mongo
```

<br><br>

```docker
// 이렇게 하고나서 NODEJS 앱을 실행시키기.
node app.js
// 로컬의 몽고DB를 제거했는데도 컨테이너에 있기 때문에 실행된다.

```	

---

<br><br>

#### b. NodeJS 이미지 도커화 

- 현재 이 애플리케이션이 컨테이너 내부에 있으므로 동일한 컨테이너 내부의 이 포트에서 그 서비스에 액세스하려고 합니다. 호스트 머신에 접근하는 것이 아니다. 

<br>
- 그래서, 여기서 사용해야 하는 특별한 대체 도메인 또는 주소가 있다. 
	- `host.docker.internal` 이다. 
	- 결론** : `mongodb://host.docker.internal:27017/course-goals`

<br>
- 중요** : 또한, 컨테이너를 실행할 때, 로컬호스트 머신에서 사용가능한 포트를 게시해야 한다.
	- 애플리케이션이 컨테이너 내부에서 수신 대기하는 포트(80)이다. 

```docker
docker build -t goals-node .
```

<br>

```docker
docker run --name goals-backend --rm -d -p 80:80 goals-node
// 이렇게하면 연결된다.
```

---

<br><br>

#### c. React SPA를 도커화시키기 

- Dockerfile 설정 

```docker
FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
```


<br><br>

- Docker 명령어** : 프론트인 React를 컨테이너에 사용하기 위해 인터렉티브 모드가 필요하다.  
	-  React의 컨테이너는 인터렉티브 모드처럼 상호호환할 수 없으면, 트리거가 동작하여 컨테이너가 종료된다.

```docker
docker run --name goals-frontend --rm -p 3000:3000 -it goals-react
// 이렇게 인터렉티브를 추가하면 프론트 컨테이너가 연결된다.
```


---

<br><br>

### 2) 효율적인 컨테이너 간 통신을 위한 Docker 네트워크 추가하기**

<br>
- 도커 네트워크를 사용하면, 더 이상 이 포트를 게시할 필요가 없습니다. 컨테이너가 동일한 네트워크에 있으면 서로 통신할 수 있기 때문이다.
<br>
- 로컬 호스트 머신은 포트 번호를 게시하지 않는 경우, 로컬 호스트 주소를 통해 이 컨테이너와 통신할 수 없었습니다. 새 컨테이너가 서로 대화할 수 있으면, 충분하다. 

<br>
- 따라서, 포트번호를 게시하는 것보다 '--network'를 추가하고 해당 네트워크에서 이 컨테이너를 실행하도록 하자.

<br>

#### a. MongoDB(DataBase)를 도커 네트워크에 연결하는 방법

- 그 전에 MongoDB 이미지를 build 명령어로 생성해야 한다. 

```docker
docker run --name mongodb --rm -d --network goals-network mongo
```

---

<br><br>

#### b. NodeJS(Backend)를 도커 네트워크에 연결하는 방법

- 그 전에 NodeJS 이미지를 build 명령어로 생성해야 한다. 

<br>
- NodeJS 코드 내부의 요청 URL 변경 : `mongodb://mongodb:27017/course-goals`

```docker
docker run --name goals-backend --rm -d --network goals-net goals-node
```

<br>

```javascript

mongodb://mongodb:27017/course-goals
``` 

---

<br><br>

#### c. React(Frontend)를 도커 네트워크에 연결하는 방법**

- React 코드 내부의 초기 요청 URL 변경 : `http://goals-backend/goals`

<br>

- React 이미지 생성 : `docker build -t goals-react .`

<br>
- 이 컨테이너는 동일한 네트워크의 일부이며, 다른 컨테이너와 통신할 수 있다. 

```docker
docker run --name goals-frontend --network goals-net --rm -p 3000:3000 -it goals-react
```

<br>
- 하지만, 이렇게 실행하면, 브라우저에서 에러가 발생한다. 그래서 아래 코드처럼 변경하자!

---

<br>
- Dockerfile

```docker

FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
```

---

<br><br>

##### 중요 : 핵심 1

<br>
- FrontEnd의 App.js에서 요청 경로!
	- 브라우저가 이해할 수 있도록 주소를 백엔드 이미지인 'goals-backend'가 아니라 아래처럼 'localhost'로 변경해줘야 한다.

```javascript
http://localhost/goals/
```

<br>
- Backend의 app.js에서 요청 경로!
	- 요청 URL을 이미지명으로 동일하다면, 이미지명으로도 변경가능 

```javscript
mongodb://mongodb:27017/course-goals
```

<br>

- 이렇게 설정하면, 아래 명령어를 통해 한 번에 NodeJS 컨테이너 내부에서 React 컨테이너를 사용할 수 있다. 
	- NodeJS의 내부 컨테이너에서 '80' 포트번호를 기다리는 것을 명령어로 설정하여 백엔드 애플리케이션에 포트 80을 게시하여 연결시켜 준다.

<br>
- 따라서, 프론트엔드 애플케이션은 로컬 호스트에서도 계속 사용할 수 있다. 프론트엔드 애플리케이션이 접근할 수 있기 때문이고 React의 동작 방식 때문이다. React는 브라우저에서 실행되는 Javascript 코드가 있기 때문이다. 

<br>
- 첫 번째 노드 앱와 통신해야 하는 두 번째 노드 애플리케이션이 있다면, 컨테이너 이름을 사용할 수 있다.

<br>
- 하지만 이것은 브라우저에서 실행되는 JavaScript 코드이므로 도커가 아니라, 브라우저가 이해할 수 있는 코드가 필요하다.

---

<br><br>

##### 중요 : 핵심 2

- 컨테이너에서 실행되는 부분인 개발 서버는 네트워크를 신경 쓰지 않기 때문이다. 

<br>
- 그 개발 서버는 노드 API 또는 데이터베이스와 상호 작용하지 않습니다. 그리고 API와 상호작용하는 부분은 도커 환경에서 실행되지 않는다.

```docker
// 이제는 프론트엔드에서 네트워크가 필요 없다.
docker run --name goals-frontend --rm -p 3000:3000 -it goals-react

```

---

<br><br>

##### 중요 : 핵심 3

- 컨테이너의 포트 80을 로컬 호스트 머신의 포트 80에 게시하고자 한다. 그것으로 React 애플리케이션이 이것과 통신할 수 있습니다.

```docker
docker run --name goals-backend --rm -d -p 80:80 --network goals-net goals-node
```

<br>
- 앞으로 해야할 것** : 데이터의 지속성, 제한된 액세스, 그리고 실행 중인 컨테이너에 반영되는 실시간 소스 코드 업데이트.


---

<br><br>

### 3) 볼륨으로 MongoDB에 데이터 지속성 추가하기

```docker
docker run --name mongodb -v data:/data/db --rm -d --network goals-net -e MONGO_INITDB_ROOT_USERNAM=max -e MONGO_INITDB_ROOT_PASSWORD=secret mongo
```

<br>
- 이번에는 환경 변수도 추가하여 실행한다는 것이다.
	- 그리고 첫 번째로 추가하고자 하는 것은	`MONGO_INITDB_ROOT_USERNAME`인데 'max'로 설정하도록 한다.
	- 그리고 두 번째 환경 변수를 한다. `MONGO_INITDB_ROOT_PASSWORD`인데 이건 'secret'라고 할당한다.

<br>
- 에러 1 : MongoDB 환경변수 설정
	- MongoDB가 이해하는 특수한 포맷을 갖기 때문이다.
	- 그 포맷은 사용자 이름과 비밀번호를 가지며 호스트 주소 앞에 '사용자 이름:비밀번호@' 형식으로 추가한다.
	- 비밀번호 다음엔 '@'기호를 추가하는군요. (@, at이므로 호스트 주소의 사용자계정이란 의미)
	- 이 계정설정은 옵션이지만 지금 우리에겐 필요하다.
	- 사용자 이름과 비밀번호가 있으니까요.
	- 그래서 이 경우에는 'max:secret@mongodb'가 된다.

<br>
- 에러 2 : 또 다른 백엔드 에러 발생. 공식 MongoDB 문서에서 그 해결책을 찾을 수 있다. 
	- 연결 문자열 끝에 이 'authSource=admin' 쿼리 매개변수를 추가해야 한다.


<br>
- Backend의 app.js에서 요청 경로!

```javscript
mongodb://max:secret@mongodb:27017/course-goals?authSource=admin
```


---

<br><br>

### 4) NodeJS 컨테이너의 볼륨, 바인딩 마운트 및 폴리싱(Polishing)**


#### a. NodeJS 컨테이너에 볼륨 생성

- 볼륨을 한 개 만들고 바인딩 마운트(절대 경로 포함)도 1개 만든다. 

<br>
- 우리가 'app' 폴더에 바인딩하는 호스트 시스템 폴더에 존재하지 않는 'node_modules' 폴더로 덮어쓰면 안 된다고 알린다. 
	- node_modules 폴더가 의존성에 의해서 받아지는데 로컬 것이 이전 버전이라면 업데이트 시, 문제가 되어서 볼륨에 만들어 둔다. 

```docker
docker run --name goals-backend -v /Users/maximilianschwarzmuller/development/teaching/udemy/docker-complete/backend:/app -v logs:/app/logs -v /app/node_modules --rm -p 80:80 --network goals-net goals-node
```

---

<br>

#### b. 소스 코드 수정 시, 재 실행하기!

- package.json 파일에 'nodemon' 라이브러리를 추가하기!(이것은 NoedeJS에서만 사용 가능)

---

<br>

#### c. Dockerfile에 환경변수 만들어서 사용하기

<br>
- Dockerfile

```docker

FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 80

ENV MONGODB_USERNAME=root
ENV MONGODB_PASSWORD=secret

CMD [ "npm", "start" ]
```

<br>
- 명령어 : 

```javscript
mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@mongodb:27017/course-goals?authSource=admin
```


---

<br>

#### d. dockerignore

- 컨테이너 내부에 이미 설치한 모든 종속성을 불필요하게 다시 복사하지 않도록 하기 위해서 설정한다.

<br>
- 이미지를 리빌드하면 이러한 중복 파일이 복사되지 않고 이미지가 빌드될 거라 보장할 수 있다.

<br>
- `.dockerignore`의 내용들

```
node_modules
Dockerfile
.git
```


---

<br><br>

### 5) (바인드 마운트로) React 컨테이너에 대한 라이브 소스 코드 업데이트하기**

- '바인딩마운트'가 필요해서 절대경로로 '바인딩마운트' 한 개 추가해주기 

```docker

docker run -v /Users/maximilianschwarzmuller/development/teaching/udemy/docker-complete/frontend/src:/app/src --name goals-frontend  --rm -p 3000:3000 -it goals-react

```

---

<br>
- 그리고 'npm install'에 의해 설치된 최신 종속성이 아니라 오래된 node_modules 폴더를 복사할 위험도 있다.


<br>
- `.dockerignore`의 내용들

```
node_modules
Dockerfile
.git
```

---


<br><br>	
	
# 2. Docker Compose : 다중 컨테이너

### 0) Docker Compose 실행 

- 1) VScode에서 Docker 플러그인 설치

<br>
- 2) yaml 파일 1개를 만들어서 docker-compose의 version 설정하여 사용하기 
	- 공식 홈페이지에서 버전 살펴보기



---

<br><br>

### 1) Docker Compose 개념

- 도커 컴포즈는 'docker build'와 'docker run' 명령을 대체할 수 있는 도구이다.

<br>
- 다수의 'docker build' 명령과 다수의 'docker run'을 단, 하나의 구성 파일로 가진다.

<br>
- 그것은 모든 서비스 모든 컨테이너를 즉시 시작하고 필요하다면 모든 필요한 이미지를 빌드하는 오케스트레이션 명령 셋(set)이다. (Orchestration, 자동화된 설정, 구글링 해보기!)

<br>
- 하나의 명령을 사용하여 모든 것을 중지하고 모든 것을 중단할 수도 있다. 우리가 선택한 텍스트 파일에 도커 명령을 저장할 수 있기 때문에 이것은 굉장하고 중요하다.

<br>
- 구성 파일을 활용한 단 하나의 명령으로 전체 다중 컨테이너 애플리케이션을 시작하거나 중단할 수 있다.

<br>
- 참고적으로 단일 컨테이너 애플리케이션에서도 도커 컴포즈를 사용할 수 있다. 하지만, 컨테이너가 여러 개인 경우에 가장 유용하다.


---

<br><br>

#### a. 특징 : 

- 도커 컴포즈는 커스텀 이미지를 위한 Dockerfile을 대체하지 않는다. 함께 동작한다.

<br>
- 도커 컴포즈는 또한 이미지나 컨테이너를 대체하지 않는다.

<br>
- 하지만, 도커 컴포즈는 다수의 호스트에서 다중 컨테이너를 관리하는데는 적합하지 않다.

<br>
- 도커 컴포즈는 하나의 동일한 호스트에서 다중 컨테이너를 관리하는데 정말 좋다.

<br>
- 단, 하나의 컴퓨터인 호스팅 머신에서 모든 것을 실행하고 있다. 현재 하나의 호스트이므로 도커 컴포즈를 사용하는데 딱 알맞다.

---

<br><br>

#### b. 핵심

- 가장 중요한 요소 항목은 이른바 서비스(Service)라 불리우는 것이다. 이는 결국 다중 컨테이너 애플리케이션을 구성하는 컨테이너라고 할 수 있다.

<br>
- 모든 서비스 아래에서 해당 서비스를 구성할 수 있다. 여기서 서비스라고 하면 실제로 컨테이너를 의미하는 것이다.

<br>
- Docker Compose로 할 수 있는 것들** :
	- 게시해야 하는 포트를 정의하고 이 컨테이너에 필요한 환경 변수를 정의할 수 있다.
	- 이 컨테이너에 할당해야 하는 볼륨을 정의할 수 있다.
	- 네트워크를 할당할 수 있다.

<br>
- 정리하면, 기본적으로 터미널에서 도커 명령으로 할 수 있는 모든 것을 도커 컴포즈에서 할 수 있다.

<br>
- 터미널에서 이러한 도커 명령을 실행하는 것을 대체하는 것이 컴포즈의 아이디어이기 때문이다.

---

<br><br>

#### c. Docker Compose 설정 간단히 정리

<br>
- 명령어 정리 :
	- 환경 변수를 environment뿐만 아니라 env_file 설정에 '.env'라는 외부 파일에도 저장 가능
	- 직접적으로 의존적인 컨테이너 연결 시키기 : `depends_on:`
	- 볼륨 설정 : 앞에서 볼륨을 생성하고 마지막의 볼륨 설정에 볼륨명을 추가해줘야 한다.
	- 인터렉티브 모드(개방적 입력 가능) : `stdin_open: true`
	- 터미널 실행(해당 터미널에 연결) : `tty: true`
	- port 번호** : 호스트 머신의 포트 3000에 포트 3000을 연결(ex) 3000:3000)


<br>
- 'build: ' 설정 : 
	- Dockerfile이 다른 중첩 폴더에 있고 그 중첩 폴더 외부의 폴더에 액세스해야 하는 경우,
	- 그러면 더 높은 수준의 폴더로 설정되어야 한다.
	- 그리고 그런 경우는 매우 헷갈립니다. 나중에 여러 컨테이너를 이용할 때, 사용할 것이다.  
	
<br>
- 'args: ' 설정 : 
	- 경로가 더 긴 형태에서는 여기에 args를 추가하여 그 아래에서 some-arg에 특정 값을 추가할 수 있다.
	- Dockerfile이 ARGS를 사용하는 경우가 있는데 도커 컴포즈를 사용할 때, 이렇게 args를 지정할 수 있다.


<br>
- 'container_name: ' 설정 :
	- 컨테이너 이름도 명명된 이름으로 설정할 수 있다.

<br>
- 중요** : front 프로젝트에는 바인딩 마운트가 1개 있는데 이제는 상대경로로 적어주어도 인식한다.(절대경로 X)
	- 여기에 frontend의 src폴더를 컨테이너 내부의 app폴더 내의 src 폴더에 바인딩하고자 합니다.
	- 이렇게 하면 바인드 마운트가 설정되며 그것으로 코드 변경 사항이 실행 중인 컨테이너에 즉시 반영됩니다.

<br>
- depends_on 설정** : 프론트 설정에 depends_on을 추가하고 backend에 의존하도록 합니다.
	- backend가 시작된 경우에만 frontend를 시작하도록 말이죠.
	- 애플리케이션에 그러한 의존 설정이 필요한지 아닌지는 여러분에게 달려 있습니다.
	- 백엔드가 시작하여 작동되지 않더라도 작동하는 애플리케이션이 있을 수 있으니까요.


---

<br><br>

#### d.  Docker Compose 설정의 미리 보기 : 


<br>
- docker-compose.yaml

```yaml
version: "3.8"
services:
  mongodb:
    images: 'mongo'
    volumes:
      - data:/data/db 
    container_name: mongodb
      # environment: env 파일로 대체
      #   MONGODB_INITDB_ROOT_USERNAME: max
      #   MONGODB_INITDB_ROOT_PASSWORD: secret
        # - MONGODB_INITDB_ROOT_USERNAME=max
      env_file:
        - ./env/mongo.env
        
  backend:
    build: ./backend
    # build:
    #   context: ./backend
    #   dockerfile: Dockerfile
    #   args:
    #     some-arg: 1 
    ports:
      - '80:80'
    volumes:
      - logs:/app/logs
      - ./backend:/app
      -  /app/node_modules
    env_file:
      - ./env/backend.env
    depends_on:
      - mongodb
  frontend:
    build: ./frontend
    ports:  
      - '3000:3000'
    volumes:
      - ./frontend/src:/app/src
    stdin_open: true
    tty: true
    depends_on:
      - backend      
  volumes: 
    data:
    logs: 
```

<br>
- backend.env

```
MONGODB_USERNAME=max
MONGODB_PASSWORD=secret
```


---

<br><br>

### 2) Docker Compose 실행 방법 :

- 모든 컨테이너 생성 및 실행 

```docker
docker-compose up
docker-compose up -d
```

<br>
- 모든 컨테이너 중지 및 삭제 

```docker
docker-compose down
```


---

<br><br>

### 3) Docker Compose에서 이미지 빌드 및 컨테이너명 지정 

#### a. 이미지 강제 리빌딩 하기

- 'docker-compose up'명령에 '--build'를 추가하여 이를 강제할 수 있다.

<br>
- 도커 허브 또는 다른 레지스트리에서 가져오는 이미지 : `docker-compose up build`


<br>
- 커스텀된 이미지로 생성 : `docker-compose build`
	- 자체 이미지의 경우, docker-compose 파일에서 찾을 수 있는 커스텀 이미지를 빌드하려는 경우 'docker-compose build'를 사용하여 이를 수행할 수 있다.

---

<br><br>

#### b. 도커 컴포즈 실행 시 , 이름 강제로 변경됨 

- 실행 중인 frondend, backend, mongo 컨테이너가 있다. 그리고, 그들의 이름도 볼 수 있다.

<br>
- frontend 컨테이너의 이름은 'docker-complete_frontend_1'이다. 여기에 backend의 이름이 있고, mongo 컨테이너의 이름도 여기에 있지만 변경된 이름이다.

<br>
- 이것은 우리가 도커 컴포즈에 정의한 이름이 아니라는 것이다. 기술적으로 단지 서비스의 이름일 뿐이며 컨테이너로 번역된다.



---

<br><br>

# 3. "유틸리티 컨테이너"로 작업하기 & 컨테이너에서 명령 실행하기


### 1) 유틸리티 컨테이너 개념


