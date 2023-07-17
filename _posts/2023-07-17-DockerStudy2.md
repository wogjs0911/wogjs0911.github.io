---
key: /2023/07/17/DockerStudy2.html
title: Docker - Docker Study2
tags: docker
---

# 1. Docker 

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

- FROM : 컨테이너의 이미지 불러오기

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
	- CMD [ "node", "server.js"]가 아니라 CMD node server.js로 실행하면, 이 이미지가 빌드될 때마다 실행되기 때문에 이러한 방식은 문제가 많아서 꼭 컨테이너가 실행되고 나서 노드 서버를 실행되도록 하자!
	- 그래서 배열 안에 담는다. 즉, 이미지는 컨테이너의 템플릿이어야 한다. 이미지를 실행하는 것이 아니라 이미지를 기반으로 컨테이너를 실행시키는 것이다. 
	- 따라서, CMD는 이미지가 생성될 때, 실행되지 않고 이미지를 기반으로 컨테이너가 시작될 때, 실행된다는 것이다. 
	- 정리하면, CMD를 통해서 컨테이너가 실행되고 나서 노드 서버를 실행되도록 하자!
	
---

	
<br><br>

#### b. 노드 애플리케이션 실습용 코드 

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
	- docker run -p 3000:80 8bc8ad4953b6e96ff7db03b3d30e5975c6a89a99826f1e238a44f9e125b3958e
	- 80은 내부 도커 컨테이너 노출 포트이다. 3000은 우리 로컬 머신의 어떤 포트이다. 

<br>
- 정리하면, 로컬 포트 3000에 publish되었기 때문에 작동하게 됩니다.
	
---

<br><br>

### 3) 
	
	


	