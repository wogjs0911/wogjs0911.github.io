---
key: /2023/07/17/DockerStudy2.html
title: Docker - Docker Study2
tags: docker
---

# 1. Docker 기본 개념

### 1) 기본 Dockerfile 설정

```docker
FROM node

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 80

CMD [ "node", "server.js"]

```

<br><br>

#### a. Dockerfile 설명

- FROM : 컨테이너에 이미지 불러오기

<br>
- WORKDIR : 작업 디렉토리 설정 

<br>
- COPY : 우리가 작성된 코드(node.js, springboot 소스코드 등등) 복사하기 
	- COPY . /app 명령어 : 첫 번째 '.'는 Dockerfile를 포함하는 전체 디렉토리이다. '/app'는 해당 코드의 파일이 도커 이미지로 저장되는 내부의 경로를 의미함. 
	- 이것은 해당 로컬 머신의 파일 시스템에서 완전히 분리된 자체 내부 파일 시스템이 있다. 즉, 도커 컨테이너 내부에 숨겨져 있다.
	- 보편적으로 도커의 루트 폴더('.')보다는 '/app' 처럼 사용자가 정의한 폴더를 사용하는 것이 좋다.

<br>
- RUN : 여기서는  npm install 실행함, 노드 애플리케이션의 모든 종속성을 설치하기 위해 npm install을 설치해야만 했다.
	- 이것은 도커 컨테이너 및 이미지의 작업 디렉토리에서 실행된다.  

<br>
- EXPOSE : 도커 컨테이너의 포트 노출시키기 
	- 아래의 코드에 의해서 이 노드 웹 서버는 포트 80에서 수신 대기하게 됩니다. 하지만, 도커 컨테이너는 격리되어 있어서 추가 설정이 필요하며 컨테이너 내부에는 자체 내부 네트워크도 있다. 
	- 결국, 컨테이너는 격리되어 있기 때문에 그 포트를 우리의 로컬 머신에 노출하지 않는다. 컨테이너 내부에서만 무언가를 계속 수신 대기한다. 정해진 그 포트에서 수신할 수 없다.
	- 이 컨테이너가 시작될 때, 우리의 로컬 시스템에 특정 포트를 노출하고 싶다는 것을 도커에게 알리는 'EXPOSE 80'이라는 명령어가 필요하다!
	- 이 컨테이너를 실행할 우리의 로컬 머신에게 노출시키며, 그런 후에 이 80 포트를 수신하고 있는 그런 컨테이너를 실행할 수 있게 된다.

<br>
- CMD : 컨테이너 실행시키기
	- 'CMD [ "node", "server.js"]'가 아니라 'CMD node server.js'로 명령어를 실행하면, 이 이미지가 빌드될 때마다 실행되기 때문에 이러한 방식은 문제가 많아서 꼭 컨테이너가 실행되고 나서 노드 서버를 실행되도록 하자!
	- 그래서 배열 안에 담는다. 즉, 이미지는 컨테이너의 템플릿이어야 한다. 이미지를 실행하는 것이 아니라 이미지를 기반으로 컨테이너를 실행시키는 것이다. 
	- 따라서, CMD는 이미지가 생성될 때, 실행되지 않고 이미지를 기반으로 컨테이너가 시작될 때, 실행된다는 것이다. 
	- 정리하면, CMD를 통해서 컨테이너가 실행되고 나서 노드 서버를 실행되도록 하자!
	
---

	
<br><br>

#### b. 노드 애플리케이션 실습용 코드 

- server.js

```javascript

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

let userGoal = 'Learn Docker!';

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <section>
          <h2>My Course Goal</h2>
          <h3>${userGoal}</h3>
        </section>
        <form action="/store-goal" method="POST">
          <div class="form-control">
            <label>Course Goal</label>
            <input type="text" name="goal">
          </div>
          <button>Set Course Goal</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/store-goal', (req, res) => {
  const enteredGoal = req.body.goal;
  console.log(enteredGoal);
  userGoal = enteredGoal;
  res.redirect('/');
});

app.listen(80);

```	
	

---

<br><br>

### 2) 기본 docker 명령어 

#### a. 도커 파일에 의한 도커 이미지 생성

- docker build . 
	- '.'는 Dockerfile이 있는 현재 디렉토리 

<br><br>

#### b. 생성된 도커 이미지 실행 시키는 방법 :
 
- 수정 전 명령어 : docker run 8bc8ad4953b6e96ff7db03b3d30e5975c6a89a99826f1e238a44f9e125b3958e
	- 8bc8ad4953b6e96ff7db03b3d30e5975c6a89a99826f1e238a44f9e125b3958e는 생성된 이미지이며 나중엔 커스텀으로 이미지 이름도 바꿀 수 도 있다.

<br>
- 수정 후 명령어 : 우리 로컬 머신의 어떤 포트가 이 내부의 도커 특정 포트에 액세스 할 수 있는지 설정해 주기 :
	- docker run -p 3000:80 8bc8ad4953b6
	- 80은 내부 도커 컨테이너 노출 포트이다. 3000은 우리 로컬 머신의 어떤 포트이다. 

<br>
- 정리하면, 로컬 포트 3000에 publish되었기 때문에 작동하게 됩니다.
	- docker run -p 3000:80 8bc8ad4953b6
	- 'http://localhost:3000' 에 접속하기!

<br><br>

#### c. 생성된 도커 이미지 실행 중지시키는 방법 :

- docker stop jovial_wozniak
	- docker name으로 stop 시키기 
	
<br><br>

#### d. 기타 명령어 :

- 터미널에서 도커 실행을 강제로 중지 시키고 싶을 때 : ctrl + c 2번 

- docker ps -a : 전체 컨테이너 목록 조회 

- docker ps : 현재 실행중인 컨테이너 조회 

	
	
---

<br><br>

### 3) 레이어 개념** 

#### a. 이미지란? 

- 이미지는 읽기/쓰기 액세스 권한이 있는 인스턴스를 설정하는 컨테이너의 '청사진'이다. 

<br>

#### b. 레이어란? 

- 이미지의 모든 명령은 캐시 가능한 레이어를 생성합니다. 레이어는 이미지 재구축 및 공유를 돕습니다. 즉, 캐시처럼 저장해놓고 사용한다. 
	


<br>

#### c. 레이어 사용방법(최적화 과정)

- npm install을 다시 실행 시킬 필요가 없어서 소스코드를 복사하기 전에 npm install 레이어가 오게 된다.

- 그렇기 때문에 소스코드 복사 명령 앞의 이러한 레이어가 무효화되지 않는다. 


```docker
FROM node

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 80

CMD [ "node", "server.js"]

```

<br>
- 한번 실행하고나서 다시 위의 명령어를 실행하면, npm install은 캐시화 되어있기 때문에 도커가 package.json파일이 변경되지 않았음을 확인했기 때문에 즉, npm istall 이전 단계가 변경되지 않았다. 그래서 재실행 시, npm install을 다시 실행할 필요가 없어서 속도가 향상된다.

<br>
- 그래서, npm install 명령어 이후로만 동작한다. 이러한 과정들은 최적화 과정의 일부분이다. 레이어 기반 아키텍처를 이해하는 것이다.


---

<br><br>

### 4) 컨테이너 중지 & 재시작

<br>

#### a. docker 'run' vs docker 'start'

- docker run ~~ 
	- docker run은 터미널을 차단한다. 

<br>
- docker start 컨테이너이름 or 컨테이너ID
	- docker start은 터미널을 차단하지 않고 컨테이너를 백업해둔다.

<br><br>

#### b. Attached 모드 vs Detached 모드

- Attached : 터미널을 차단하고 실행(컨테이너는 foreground에서 실행)
	- docker run에서 디폴트 모드
	- 그 컨테이너의 출력결과를 터미널을 볼 수 있으며 수신한다는 의미이다. 

	
```docker

docker run -p 8000:80 2ddf2ede7d6c

```

---

<br>
- Detached : 터미널을 차단하지 않고 실행(컨테이너는 background에서 실행)
	- docker start에서 디폴트 모드
	- 터미널에서는 출력 결과를 볼 수 없다.
		- docker run에 '-d'를 붙이면, Detached 모드로 동작
		
```docker

docker run -p 8000:80 -d 2ddf2ede7d6c

```


<br><br>

#### c. Stop(컨테이너)


- Stop : 컨테이너 중지시키기
	- 컨테이너를 중지시키고 다시 docker run으로 실행시키면, 기존의 컨테이너가 다시 실행된다. 기존의 컨테이너가 없다면, 컨테이너가 새로 만들어진다.

```docker
docker stop eloquent_brown
```

<br><br><br>

#### d. Logs(로그 보기)

- Logs : Attached 모드처럼 컨테이너 출력 결과를 확인할 수 있다. 

<br>

- a) 기존의 로그 출력 결과를 다시 볼 수 있다.

```docker

docker logs eloquent_brown

```

<br>

---

- b) 기존의 로그 출력 결과와 '향후' 로그 출력 결과를 다시 볼 수 있다.
	- '-f'가 follow이다.

```docker

docker logs -f eloquent_brown

```

<br>

---

- c) start로 시작해도 Attached 모드로 실행할 수 도 있다. 자유로운 것 같다. 
	- '-a'를 붙이면, Attached로 동작

```docker

docker start -a eloquent_brown

```


<br><br>

#### d. 인터렉티브 모드**

- 도커는 웹서버나 노드에서만 사용할 수 있는 것이 아니다. 필요에 따라 컨테이너와 상호 작용할 때도 사용된다.

```docker
docker start -a -i heuristic_haslett
```

<br>
- 기존의 Detached 모드와는 다른 의미이다. 더 공부해봐야 알 것 같다. 
	- '-i' : 인터렉티브 모드이다. 컨테이너에 무언가를 입력할 수 있다.
	- '-t' : pseudo(의사) TTY가 할당된다. 터미널을 생성한다는 것을 의미한다.

<br>
- `docker start -a -i heuristic_haslett`라는 명령어를 이렇게 입력하면, 최솟값과 최댓값을 입력하여 그사이의 임의의 값을 확인할 수 있다. 

---

<br><br>

### 5) 이미지 삭제 및 분석, 컨테이너 중지 시, 자동 삭제

#### a. 이미지 삭제하는 방법
	
- 전체 이미지 조회 : 
	- docker images 

<br>
- 이미지 제거하기 :
	- docker rmi 이미지ID
	
<br>
- 현재 실행되지 않고 있는 이미지 제거하기 :
	- docker image prune

<br>
- 이미지 여러 개 한 번에 제거하기 :
	- docker rmi 이미지ID1 이미지ID2 이미지ID3

---

<br>

#### b. 주의 사항** : 

- 이미지를 삭제하기 위해서는 해당 이미지를 담고 있는 컨테이너를 중지시키고 삭제시켜야 한다.

---

<br>

#### c. 중지된 컨테이너 자동으로 삭제하는 방법

- 도커에서 자주 쓰이는 방법이다. 하지만, 데이터도 같이 삭제되기 때문에 나중에는 볼륨이라느 개념을 이용한다.
	- '--rm' 이용하기

```docker

docker run -p 3000:80 -d --rm 2ddf2ede7d6c

```

---

<br>

#### d. 이미지 검사하기(조사 및 분석)


```docker

docker image inspect 2ddf2ede7d6c

```

- 위의 명령어를 이용하면 이미지를 분석할 수 있다. 
	- a) 이미지가 생성된 시간 확인 가능
	- b) 컨테이너에 대한 구성 표시 가능
		- 노출될 포트, 자동으로 설정되는 일부 환경 변수, 사용중인 도커 버전, EntryPoint, 해당 이미지가 구축된 OS 환경, 다른 레이어들

<br>
- 자주 사용하지는 않지만 이미지와 컨테이너의 작동 과정을 살펴보거나 이미지ID 등을 까먹었을 때는 유용하게 이용된다. 


---

<br><br>

### 7) 컨테이너에/컨테이너로 파일 복사하기

#### a. 로컬 폴더(로컬 호스트 머신의)의 파일을 컨테이너로 복사하기
  
- `docker cp dummy/. boring_vaughan:/test`
	- 명령어 정리 : `docker cp '로컬폴더 경로' '컨테이너이름':'복사하려는 컨테이너 내부의 경로'`

<br>

#### b. 컨테이너의 파일을 로컬 폴더의 파일로 복사하기  

- `docker cp boring_vaughan:/test dummy`

<br>
- 파일을 구체적 대상으로 삼고 싶을 때, 
	- `docker cp boring_vaughan:/test/test.txt dummy` 

<br>

#### c. 사용 용도  

- 지금은 자주 사용하지 않지만 웹 서비스에서 변경하려는 웹 서버의 구성파일에서 이용한다.
- 컨테이너 내부에서 로컬 호스트 시스템으로 파일과 폴더를 복사할 때, 사용한다. 


---

<br><br>

### 8) 컨테이너와 이미지에 이름 지정 & 태그 지정하기

#### a. 컨테이너에 이름 지정하기!

- `docker run -p 3000:80 -d --rm --name goalsapp 2ddf2ede7d6c`
	- '--name 원하는이름' 명령어 추가하기


<br>
#### b. 이미지에 태그 지정하기!

- `docker build -t goals:latest .` 
	- '-t 이미지Name:태그이름'으로 명령어가 동작한다. 

---

<br>

#### c. 그 이미지를 기반으로 컨테이너(앱)을 실행시키는 방법 

- `docker run -p 3000:80 --rm --name goalsapp goals:lastest`

---

<br><br>

### 9) 이미지 공유하기 + DockerHub

#### a. 컨테이너 공유법(이미지를 공유하는 방법)

- 컨테이너를 공유한다는 의미가 이미지를 공유하는 방법이다.

- 이미지가 있는 모든 사람은 그 이미지를 기반으로 컨테이너를 만들 수 있기 때문이다.

- 나중에 배포를 위해 공유하는 경우, 지금처럼 raw Dockerfile이 아니라 완성된 이미지를 공유하게 된다. 

---

<br><br>

#### b. DockerHub 이용하여 이미지 push하기

- push하기 위해서 DockerHub 사용자의 인증이 필요하다.

<br>
- 1) DockerHub에 아이디를 만들고 저장소 만들기
	- 예시) 아이디 : academind
	- 저장소 이름: node-hello-world

<br>
- 2) 기존 로컬 호스트 머신에서 기존에 존재하는 이미지를 복제하기
	- `docker tag node-demo/latest academind/node-hello-world`
		- node-demo/latest는 기존의 이미지 이름 + 이미지 태그 이름
		- academind/node-hello-world는 새로운 이미지 이름 

<br>
- 3) DockerHub로 이미지를 push하기
	- `docker push academind/node-hello-world`

<br>
- 4) 인증** : DockerHub로 이미지를 push하기 위한 인증하기
	- `docker login`
		- 해당 명령어를 통해 인증하여 권한을 부여 받고 이미지를 push하기
		
<br>
- 5) 특징** : 
	- 전체 이미지를 push하면 용량이 크기 때문에 DockerHub에 이미지로부터 없는 추가정보만 푸쉬한다. 

---

<br><br>
 
#### c. 공유 이미지 가져오기(pull) & 사용하기(DockerHub)

<br>

- pull 하기 위해서는 인증이 필요없다. logout 상태여도 가능하다.

<br>

##### a) 명령어 : `docker pull academind/node-hello-world`

- 기존의 github 이용하던 것과 같다. 

<br>

##### b) 주의점**

- 1) docker run을 실행하면 로컬 시스템에서 먼저 이미지를 찾고 없다면 DockerHub에서 찾게 된다.

- 2) 하지만, 로컬의 이미지가 최신 버전의 이미지가 아니라면 docker run을 실행하기 전에 docker pull로 최신 이미지를 받아야한다.

- 3) 이렇게 하지 않으면 구버전의 이미지로서 앱을 실행시킬 수 있다.




---

<br><br>	
	
# 2. 데이터 관리 및 볼륨으로 작업하기

### 1) 볼륨 개념 

- 컨테이너가 종료될 때, 손실되지 않아야 하는데 데이터가 존재하도록 해준다.

<br>
- 이러한 영구 앱 데이터는 read-write 데이터이다. 영구적으로 저장되어야 한다. 

<br>
- 우리는 컨테이너에 데이터를 저장하지만, '볼륨'의 도움을 받게 된다. 즉, 도커의 핵심 개념이다. 


---

<br><br>	

### 2) 예시 코드 

#### a. 디렉토리 구조 

- public 폴더 : 호스팅 중인 스타일 파일이 있는 public 폴더가 있다.
	- 애플리케이션의 소스코드

<br>
- temp 폴더 : 임시 생성된 파일을 저장.
	- 임시 저장소 

<br>
- feedback 폴더 : feedback 폴더에 파일이 이미 있는지 판단하여 파일이 아직 존재하지 않으면 복사한다. 
	- 영구적인 저장소

---
	
<br><br>

#### b. 데모 앱 구축하고 이해하기

- Dockerfile 이용

<br>
- 해당 앱은 사용자가 글을 등록하면, 해당 글의 제목으로 만들어진 파일을 feedback(영구적 저장소) 폴더에서 저장된 파일을 볼 수 있다.

<br>
- 도커화(Dockerize)시키는 Dockerfile 구현
	
```docker
FROM node:14

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 80

CMD [ "node", "server.js" ]

```



<br><br>	

##### a) 도커 내부의 파일 시스템 이해하기 

- 해당 데모 앱을 실행시켜서 동작시켜서 파일을 저장하면, 로컬 호스트 머신의 feedback 폴더에서는 저장된 파일을 찾을 수 없다. 

<br>
- 즉, 도커 컨테이너 내부에서만 저장된 파일이 존재하므로 웹 브라우저에서는 확인할 수 있지만, 로컬 호스트 머신에서는 물리적으로 저장된 파일을 확인할 수 없다.

<br>
- 우리의 로컬 폴더와 이 이미지 내부 파일 시스템 사이에는 연결이 없다. 

<br>
- 컨테이너는 결국 격리되어야 한다. 

---

<br><br>

### 3) 격리 개념과 컨테이너의 문제점 이해하기**

#### a. 개념 정리 

- 이미지를 빌드하는 Dockerfile 개념이 있다. 
	- 그 이미지에는 호스팅 시스템의 파일 시스템에서 분리된 자체 내부 파일 시스템이 있다.
	- 그 이미지를 기반으로 도커 컨테이너를 시작하면, 그 이미지 위에 얇은 read-write 레이어로 컨테이너가 추가된다.

<br>

#### b. 문제점 

- 하지만, 파일 시스템이 컨테이너 내부에만 있다는 것이다. 

- 컨테이너를 삭제하고 다시 새 컨테이너를 생성하면, 기존에 저장된 임시 데이터들은 모두 삭제 된다.

<br>

#### c. 특징**

- 따라서, 컨테이너가 파일을 생성할 때, 이 파일을 이미지에 write하지 않는다. 즉, 상단에 추가되는 자체 read-write 레이어에 저장한다.

<br>
- 그래서, 컨테이너가 제거되면, 변경되지 않는 이미지만 남게 됩니다.

<br>

##### a) 중요** 

- 동일한 이미지 상에서 실행되어진 이전 컨테이너에 의해 변경된 것이 없는 동일한 기본 파일 시스템으로 시작된다.

- 그래서, 동일한 이미지에 기반한 다수의 컨테이너가 서로에게 완전히 격리되는 것이며 도커의 핵심 개념이다. 

<br>	

##### b) 결론** 

- 이렇게 컨테이너가 삭제되더라도 이전에 저장된 데이터가 영구히 저장되도록 하려면 어떻게 해야할까? 
	- 볼륨 개념 이용하기



---

<br><br>

### 4) 볼륨 개념**

- 데이터를 유지하도록 도우며, 이전의 문제점을 해결하는데 도움을 준다.

<br>
- 볼륨은 호스트 머신의 폴더에 저정된다. 컨테이너나 이미지에 있는 것이 아니다.** 

<br>
- 호스트 컴퓨터에 장착된 하드 드라이브에 존재하여 사용가능하거나 컨테이너로 매핑되는 것을 의미한다.

<br><br>

---

#### a. Dockefile의 'COPY' 명령어와 다른점** :

- 해당 Dockefile의 COPY는 실제로 복사하도록 명령한 경로와 파일의 스냅샷을 취한 다음 이러한 파일과 폴더를 '이미지'에 복사하는 게 전부이다. 

<br>
- 이미지에 복사되는 일회성 스냅샷일 뿐이다. 


<br><br>

---

#### b. '볼륨' 개념(중요)** :  	

- 컨테이너 내부의 폴더를 호스트 머신 상의 컨테이너 외부 폴더에 연결할 수 있다.

<br>
- 두 폴더의 변경 사항은 다른 폴더에 반영된다. 
	- 호스트 머신에 파일을 추가하면, 컨테이너 내부에서 액세스할 수 있다.
	- 컨테이너가 매핑된 경로에 파일을 추가하면, 컨테이너 외부, 즉 호스트 머신에서도 사용할 수 있습니다. 


<br><br>

---

#### c. 정리 :  	

- 컨테이너가 제거되어도 해당 볼륨이 유지되므로 그 볼륨의 데이터가 유지됩니다.

<br>
- 그 컨테이너는 볼륨에 데이터를 읽고 쓸 수 있다. 도커의 매우 핵심적인 기능이다. 

<br>
- 컨테이너 외부에서 액세스하려는 폴더와 단순히 컨테이너 종료 및 컨테이너 제거후에도 생존해야하는 데이터에 사용할 수 있다.




---

<br><br>

### 5) 볼륨의 또 다른 문제점**

#### a. 데모 앱 상황

- 컨테이너의 외부 폴더에 매핑되어질 내 컨테이너 내부 위치이며 데모 앱에서는 feedback이 영구 저장소라서 해당 명령어로 구현
	- `VOLUME [ "/app/feedback" ]`

```docker
FROM node:14

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 80

VOLUME [ "/app/feedback" ]

CMD [ "node", "server.js" ]

```

---

<br><br>

#### b. 문제점 발생

- 새로운 이미지를 만들어서 docker run을 하면 다음과 같은 에러 발생 
	- docker build -t feedback-node:volumes .
	- docker run -d -p 3000:80 --rm feedback-app feedback-node:volumes

<br><br>

##### a) 문제점  

- 장치간(cross-device) 링크가 허용되지 않는 문제점 발생 

- awesome.txt 파일을 temp폴더에서 feedback 폴더로 옮기려고 할 때, 에러가 발생한다.


<br><br>

##### b) 해결 방법 

- 컨테이너 파일 시스템 내부의 다른 폴더로 이동하지 않고 컨테이너 밖으로 이동시킬 뿐이다.

- 특정한 메서드가 이러한 것을 좋아하지 않아서 express 코드의 rename 메서드를 copyFile 메서드로 변경하고 unlink 메서드를 추가하여 await를 붙여서 동기적으로 실행시켜 준다. 
	- 본질적으로 파일을 복사하고 그후에 수동적으로 삭제시킨다.

```javascript

await fs.copyFile(tempFilePath, finalFilePath);
await fs.unlink(tempFilePath);

```



<br><br>

##### c) 해결 후 또 다른 문제

- 위의 소스코드로 변경 후 이미지를 삭제하고 다시 생성한다.

- 해당 이미지를 통해 docker run을 하여 새 컨테이너를 생성 후 앱을 동작시킨다..

- 하지만, 새 컨테이너에 파일을 저장하면, 새로 생성되어서 저장된 파일을 찾을 수 없다. 

- 왜 이러한 문제가 발생한 것일까? 





---

<br><br>

### 6) 볼륨의 새로운 문제점(바인드 마운트)


#### a. 볼륨(Volumes)

##### a) 익명의 볼륨 

- 익명의 볼륨은 도커의 내부에 어딘가에 저장이 된다. 사용자는 해당 경로를 물리적으로 알 수가 없다.

- 도커가 관리하는 볼륨 조회 명령어 :
	- `docker volume ls` 

- 익명의 볼륨은 위의 명령어로 컨테이너가 존재하는 동안에만 실제로 존재하게 된다.
	- 따라서, 컨테이너를 중지하면, 익명의 볼륨은 삭제된다.

- 컨테이너에 정의된 경로는 생성된 어떤 볼륨에 매핑이 됩니다. 호스트 머신 상의 생성된 경로로 연결이 된다. 
	- 즉, 호스트 머신의 어떤 폴더에 매핑이 된다. 하지만, 그것의 정확한 경로는 사용자는 모르고 도커에서만 관리하기 때문에 도커만 알 수 있다. 


<br><br>

##### b) 명명된 볼륨(Named Volume)**

- 컨테이너의 데이터를 영구히 저장하는 방법** : 
	- `-v '명명된볼륨명':'호스트머신경로'`

```docker
docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback feedback-node:volumes
```

- 도커가 호스트 머신에 폴더를 만들어 컨테이너 내부의 이 폴더에 연결하지만, 이 볼륨은 우리가 선택한 이름으로 저장된다. 

- 명명된 볼륨은 하나의 컨테이너에만 연결되지 않는다. 익명의 볼륨은 하나의 컨테이너에만 연결된다. 

- 중요** : 따라서, 하나의 볼륨을 여러개의 컨테이너가 공유해서 데이터를 공유하여 사용할 수 있다. 

<br><br>

##### c) 익명 볼륨 관리의 이해 및 삭제하기**

- 익명의 볼륨이 삭제되는 이유는 docker run에 --rm 명령어가 포함 되었기 때문이라서 --rm이 없다면, 익명의 볼륨이 삭제되지는 않는다.

- 하지만 컨테이너를 새로 만들 때마다 익명의 볼륨이 새로 생기는 것으로 문제점을 해결하는데 도움을 주지는 않는다.

- 이제는 사용하지 않는 익명 볼륨이 쌓이기 시작합니다. 
	- `docker volume rm VOL_NAME` 또는 `docker volume prune`을 통해 그러한 볼륨을 삭제할 수 있습니다.

---


<br><br>

#### b. 바인드 마운트(Bind Mounts)


##### a) 문제점 발생 :

- 우리가 소스 코드에서 무엇이든 변경할 때마다, 그럴 때마다 이미지를 다시 빌드하지 않는 한 컨테이너에 반영되지 않는다.


<br><br>

##### b) 특징 :

- 도커에 의해 관리되는 볼륨의 위치, 즉, 호스트 머신의 파일 시스템 상의 볼륨이 어디에 있는지 바인드 마운트는 다 알고 있다 . 

- 호스트 머신 상에 매핑될 컨테이너의 경로를 설정하기 때문이다. 

<br><br>

##### c) 바인딩 마운트 동작 과정 :

- 컨테이너는 볼륨에 쓸 수 있을 뿐만 아니라 볼륨에서 읽을 수도 있기 때문에 소스 코드를 이러한 바인드 마운트에 넣을 수 있다.

- 컨테이너는 이를 인식하여 소스코드를 실제로 스냅샷에서 복사하는 것이 아니라 바인딩 마운트에서 복사한다.

- 그 폴더는 호스트 머신의 어떤 폴더에 연결된 것이다. 그래서, 컨테이너는 항상 최신 코드에 액세스할 수 있는 것이다.

- 스냅샷 뿐만아니라 처음에 이미지를 생성할 때에 그 이미지에도 넣는다. 

<br><br>

##### d) 일반 볼륨과의 차이점** : 

- 영구적이고 편집 가능한 데이터에 적합하다.

- 명명된 데이터는 영구적으로 데이터를 저장하지만 편집은 실제로 불가능하다. 호스트 머신의 어디에 저장되어 있는지 모르기 때문이다. 

<br><br>

##### e) 바인딩 마운트 사용 방법** : 

<br>
- `-v '절대경로(호스트 머신 상의 경로)':'컨테이너 내부의 매핑하려는 폴더이자 WORKDIR의 경로'`

<br>
- 모든 소스코드를 '/app'에만 복사하고 있다.(WORKDIR)

<br>
- 절대경로에서 마지막 파일명은 제거해야 한다. 즉, 여기서 절대 경로는 프로젝트의 폴더 경로를 의마한다. 

<br>
- 파일명을 제거한 이유는 폴더 전체를 공유하고자 하기 때문에 파일명을 제거했다. 하지만, 특정 파일만 공유하기 위해서는 파일명을 적자 .

<br>
- 경로를 ""로 묶는 경우는 특수문자가 섞인 경우이다.	

```docker
docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "파일명을 제거한 절대경로:/app" feedback-node:volumes
```

<br><br>

##### e) 바인딩 마운트의 문제점** : 

- 1) Docker GUI에서 지금 공유하고 있는 폴더가 여기에 리스팅 되는지 확인해야 한다.

<br>
- 2) 하지만, 바인딩 마운트의 경로를 설정하여 docker run을 실행하면, 노드 코드가 실행을 시작하지도 않는다는 문제점이 발생한다.

<br>
- 3) docker run 명령어에서 '--rm' 명령어를 빼도 문제가 발생한다.

<br>
- 3) 'docker logs'로 확인해보면, Dockerfile의 'npm install'에 의해 모든 종속성을 설치하는데도 문제가 발생했다.

<br>
- 4) 이것은 새로 만들어진 바인딩 마운트에 의해 발생하는 문제점이다. 

<br><br>

##### f) 바인드 마운트 – 바로 가기(Shortcuts)

- 항상 전체 경로를 복사하여 사용하고 싶지 않은 경우, 다음 바로 가기를 사용할 수 있습니다.

<br>
- macOS / Linux: -v $(pwd):/app

<br>
- Windows: -v "%cd%":/app



---

<br><br>

### 7) 바인드 마운트의 새로운 문제점 해결

#### a. 문제점 

- 마운트를 컨테이너에 바인딩하면, 'app' 폴더의 모든 것을 로컬 폴더로 덮어 쓰기 때문이다. 

<br>
- 이 로컬 폴더에는 이 앱에 필요한 모든 종속성이 있는 'node_modules' 폴더가 없습니다. 이것이 오류가 발생한 이유이다.

<br>
- 로컬 폴더에서는 'npm install'을 실행하지 않고 도커에서만 실행하기 때문에 server.js는 Express 패키지, Express 종속성 코드을 필요로 한다. 하지만, npm install은 로컬 폴더에서 실행하지 않기 때문에 Express 코드는 에러가 발생하게 되는 것이다. 

<br>
- 로컬 폴더를 'app' 폴더에 마운트하기 때문에 이미지와 컨테이너를 설정할 때, Dockerfile에서 수행한 모든 작업을 덮어 쓴다. 즉, '/app'이라는 로컬 폴더로 덮어쓰게 된다.(아래 명령어에서 확인하기!)


```docker
docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "파일명을 제거한 절대경로:/app" feedback-node:volumes
```

---

<br><br>

#### b. 해결 방법**

- 도커가 여기 로컬 호스트 폴더를 덮어쓰지 않는다. 대신 여기 로컬 호스트 폴더와 그 안에 있는 콘텐츠가 도커 컨테이너에 있는 내용을 덮어쓰게 된다. 

<br>
- 하지만, 이 때문에 node_modules 등이 제거되었다. 그래서, 이를 해결하기 위해서는 도커에게 알려줘야 한다. 즉, 내부 파일 시스템에 특정 부분이 있다는 것을 알려줘야한다. 

<br>
- 결론** : 도커 컨테이너에 익명 볼륨을 추가하는 것이다. 익명의 볼륨이 도움이 될 수 있는 사용 사례이다.

<br>

```docker
// 예시
docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "파일명을 제거한 절대경로:/app" -v /app을 포함한 특정 폴더 경로  feedback-node:volumes
```

---

<br><br>

- 주의** : 콜론 앞에 로컬 머신 경로가 붙으면, '바인드 마운트'가 된다. 하지만, 콜론 앞에 경로가 아닌 것이 붙으면 볼륨 이름으로 취급되어 '명명된 볼륨'이 된다. 


```docker
docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "/Users/maximilianschwarzmuller/development/teaching/udemy/docker-complete:/app" -v /app/node_modules  feedback-node:volumes
// Dockerfile에도 직접 사용할 수 있지만, 이미지를 재빌드 해야해서 명령어로 한번에 처리하자!
```

<br>
##### 중요!** : 

<br>
- 이 폴더, 그 폴더에 있는 모든 것들을 '/app' 폴더에 바인딩하는 것이기 때문에 문제가 발생할 것이다.
	- 도커는 항상 컨테이너에 설정하는 모든 볼륨을 평가한다. 
	- 충돌이 있는 경우 '/app'이라는 경로보다는 더 긴 폴더 경로를 신뢰하기 때문에  `-v /app/node_modules`라는 경로를 우선하여 작성하자! 

<br>
- 이 바운드 마운트는 실제로 'node_modules' 폴더를 전달하지 않는다. 그래서 이 'node_modules' 폴더는 존재하지 않는 'node_modules' 폴더를 덮어쓰는 것이다. 'npm install'을 실행하면 'node_modules' 폴더가 디폴트로 저장된다.

<br>
- 간단히 정리하자면, 'npm install'을 사용하여 이미지 생성 중에 생성된 'node_modules' 폴더는 살아남아 실제로 여전히 바인딩 마운트와 함께 공존하게 된다. 'node_modules'는 일종의 예외처리 된다.

<br>
- 바인드 마운트를 추가했기 때문에 소스코드를 수정하면 바로 적용된다. 이러한 모습은 익명 볼륨을 추가하는 경우에만 작동한다. 'node_modules' 폴더가 바인드 마운트 폴더의 내용물로 덮여쓰여지지 않기 때문이다. 

<br>
- 최종** : 이렇게 하면, 소스코드가 변경되어도 이미지를 재빌드하지 않아도 변경사항이 반영된다.** 


---


<br><br>	
	
# 3. 다른 컨테이너와 통신




	
	
	
	
	
	
	
	
	
	
	