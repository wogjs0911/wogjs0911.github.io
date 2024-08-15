
---
key: /2024/01/14/Project-Etirovaf.html
title: Project - Etirovaf
tags: docker docker-compose Vite React JPA queryDSL
--- 

# 1. Infra

### 1) 3Tier-Docker-Compose 사용기 

- etirovaf의 초기 개발 환경 구조는 `Docker` 환경에서 `React(+ Vite)` + `SpringBoot` + `MySQL(MariaDB)`으로 `3tier-docker-compose` 개발 환경을 구성했다. 

<br>
- 초기 프로젝트 설정에서 SpringBoot 프로젝트를 jar 파일로 만들기 위해 빌드를 하면 다음과 같은 에러가 발생한다.
	- `DataSourceBeanCreationException`을 뱉는데 test에서 connection을 제대로 맺지 못하고 뱉는 에러이다. 즉, `SpringBoot Server`보다 먼저 `MySQL server`가 container로 올라가 있어야 했다. 하지만, 초기 프로젝트 설정에서는 아직 올라가있지 않기 떄문에 BUILD FAILED dependencies는 제대로 받아 왔기 때문에 해당 에러는 무시하면 된다.

<br>
- 최종 정리** : 초기 프로젝트 디렉토리 구조 설계 후 `docker compose up --build` 명령어를 통해 도커 컨테이너를 빌드하면 database 디렉토리에 .sql 파일이 없기 때문에 생성하는 동안 도커 컨테이너가 실행하는 동안 여러 번의 restart 과정을 겪게된다. 
	- 그 후에 database와 서버가 정상적으로 실행되므로 docker-compose 개발 환경에서 초기 프로젝트 빌드 후 실행 시, 에러가 나더라도 무시하면 된다.

---

<br><br>

#### a. docker-compose 설정 코드 

- docker-compose.yml

```yml
version: '3.8'

services:
  database:
    image: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ~~
      MYSQL_DATABASE: ~~
      TZ: Asia/Seoul
    ports:
      - '3306:3306'
    volumes:
      - ./database/data:/var/lib/mysql
      - ./database/conf.d:/etc/mysql/conf.d
      - ./database/db/initdb.d:/docker-entrypoint-initdb.d
    networks:
      - etirovaf-network
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      SPRING_DATASOURCE_URL: ~~
      SPRING_DATASOURCE_USERNAME: ~~
      SPRING_DATASOURCE_PASSWORD: ~~
      TZ: Asia/Seoul
    ports:
      - '8080:8080'
    depends_on:
      - database
    networks:
      - etirovaf-network
  frontend:
    build:
      context: ./front
      dockerfile: Dockerfile
    restart: always
    ports:
      - '3000:3000'
    volumes:
      - ./front/src:/app/src:ro
    depends_on:
      - backend
    networks:
      - etirovaf-network

networks:
  etirovaf-network:
    driver: bridge
```

---

<br>

- backend/DockerFile

```Dockerfile
FROM amazoncorretto:17
ARG JAR_PATH=./build/libs
COPY ${JAR_PATH}/*.jar .
ENTRYPOINT ["java","-jar","backend-0.0.1-SNAPSHOT.jar"]
```

---

<br>

- front/DockerFile

```Dockerfile
FROM node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT ["npm", "run", "dev"] 
```

---

<br><br>


### 2) 컨테이너 내부에서 사용할 계정의 권한 정의하는 방법

- [Docker volume permission 문제 해결 과정 : 참고](https://sweethoneybee.tistory.com/28) 

<br>
- 도커 관리용으로 새로운 유저를 생성하고 docker 그룹에 넣어주고 VOLUME으로 지정되는 디렉토리를 내가 원하는 user가 owner가 되도록 직접 미리 mkdir 해서 디렉토리의 쓰기 권한도 해결!
	- 하나의 커널로 관리되기에 UID로 매핑이 되는 것! 여기서, username은 편의상 사용하는 것이다.
	- 그래서 [여기서](https://github.com/jinho-yoo-jack/wanted-preonboarding-challenge-backend-16/issues/1) docker-compose.yml에서 권한을 이런식으로 사용했다. 도커에서는 하나의 커널로 관리되기 때문이다.

<br>	
- 중요한 점이 username은 여기서 쓰이지 않고 uid가 쓰인다는 것이다. 도커 컨테이너를 서버에서 실행시킬 때, 여전히 하나의 커널만이 존재한다. 도커 컨테이너를 실행하고 있는 서버 내의 전체 uid, gid를 하나의 커널이 관리하고 있다는 것을 의미한다. 그러다보니 컨테이너들 내에서 같은 uid를 가진 다른 user를 가질 수 없다.

<br>	
- 일반적인 리눅스 내의 username(group name도 마찬가지)은 커널의 한 부분이 아니라 외부 툴에 의해서 관리되고 있기 때문이다(/etc/passwd, LDAP, Kerberos 등등). 그래서, 다른 컨테이너 내에서 같은 username을 가질 수는 있어도 같은 uid/gid에 대해서 다른 권한을 가질 수는 없다.


---

<br><br>

### 3) Github Actions를 이용한 CI/CD 구축 에러 모음 

#### a. SpringBoot 프로젝트 Github Actions으로 빌드 시, Gradlew 파일 없어서 에러 발생

- 문제 상황 : gradle not found 에러 발생

<br>
- 해결 방법 : 로컬 프로젝트 root 경로에서 직접 `gradle` 설치 후 `grade Wrapper` 명령어로 gradle 파일 생성하기 
	- 이후에 git commit 후 원격인 github에 gradlew 파일 push하고 Github Actions로 빌드 다시 진행!

---

<br><br>

#### b. EC2에서 docker, docker-compose 설치 방법 :

- EC2 내부에서 아래 명령어 진행!

<br>
- 1) sudo -s : 관리자 권한으로 실행!

<br>
- 2) sudo yum update -y : 시스템 패키지 목록을 최신 상태로 업데이트합니다.

<br>
- 3) sudo yum install docker -y : Docker CE(Community Edition)를 설치합니다.

<br>
- 4) sudo systemctl start docker,  sudo systemctl enable docker : Docker 서비스를 시작하고, 시스템 부팅 시 자동으로 시작하도록 설정합니다.

<br>
- 5) sudo usermod -aG docker ec2-user : sudo 없이 Docker 명령어를 사용하려면 현재 사용자를 docker 그룹에 추가합니다.((Docker 그룹에 사용자 추가 (선택 사항),  EC2 사용자 이름은 실제 환경에 맞게 수정해야 합니다.))

<br>
- 6) newgrp docker: 변경 사항을 적용하기 위해 로그아웃 후 다시 로그인하거나 다음 명령어를 실행합니다.

<br>
- 7) docker --version : docker 버전을 확인하여 설치가 정상적으로 완료되었는지 확인합니다.

<br>
- 8) sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose : Docker Compose 설치: 여러 컨테이너를 함께 관리하는 Docker Compose를 설치할 수 있습니다.

<br>
- 9) sudo chmod +x /usr/local/bin/docker-compose : Docker Compose 설치: 여러 컨테이너를 함께 관리하는 Docker Compose를 설치할 수 있습니다.

<br>
- 10) docker login : Docker 저장소 설정: Docker Hub 또는 다른 레지스트리에 로그인하여 이미지를 pull/push 할 수 있도록 설정합니다.

---

<br><br>

#### c. EC2에서 libcrypt 에러 발생

- EC2에서 아마존 리눅스 2023 인스턴스 사용 시, docker-compose.yml 실행에서 `[31847] Error loading Python lib '/tmp/_MEIMMZKnV/libpython3.7m.so.1.0': dlopen: libcrypt.so.1: cannot open shared object file: No such file or directory` 에러가 발생
	- Amazon Linux 2023에서 libcrypt.so.1 관련 에러가 발생하는 경우, 라이브러리를 설치하여 해결할 수 있다. Amazon Linux 2023는 최신 버전을 사용하는데, 이는 이전 버전과 호환되지 않을 수 있다. 이러한 호환성 문제를 해결하기 위한 라이브러리이다. `libxcrypt-compatglibclibcrypt libxcrypt-compat`

<br>
- 해결 방법 1. : EC2 인스턴스에 SSH로 접속하여 다음 명령어를 실행 -> `sudo yum install libxcrypt-compat -y` 

<br>
- 해결 방법 2 : libxcrypt-compat설치 후 Docker Compose 명령어를 다시 실행하여 문제가 해결되었는지 확인합니다.


---

<br><br>

#### d. Github Actions를 통해 EC2로 .env 파일 전송 시, 민감 정보인 Database URL 못 읽는 현상 발생!

- 문제 과정 1 : appplication.yml에서 `SPRING_DATABASE_URL`이 EC2에 포함되지 않아서 .env 파일을 Github Actions에서 workflow에서 직접 생성하였다. 
	- 하지만, Github Secrets key로 전송하려고 하는데 `=`나 `&` 등의 특수문자는 Github Secrets key에서 저장되지 않아서 base64로 인코딩 후 전송하려고 했다.

<br>
- 문제 과정 2 : 깃허브 시크릿 키 패턴 때문에 SPRING_DATABASE_URL을 아래와 같이 변경 해야함! 하지만, 이렇게 변경하여 EC2로 .env 파일을 전송하면, 이번엔 docker-compose에서 실행 시, SPRING_DATABASE_URL를 읽지 못해버린다. 
	- ‘jdbc:oracle://test:3301/test2%3FuseSSL%3Dfalse%26allowPublicKeyRetrieval%3Dtrue'

<br>
- 최종 해결 방법 : Github에서 여러 개의 시크릿 키로 분리:
	- 긴 문자열을 여러 개의 시크릿 키로 분리하여 저장하는 방법도 있습니다. 예를 들어, 다음과 같이 분리할 수 있다.
	- `SPRING_DATASOURCE_PROTOCOL` : jdbc:oracle
	- `SPRING_DATASOURCE_HOST` : test
	- `SPRING_DATASOURCE_PORT`: 3301
	- `SPRING_DATASOURCE_DATABASE` : test2
	- `SPRING_DATASOURCE_OPTIONS` : useSSL=false&allowPublicKeyRetrieval=true


---

<br><br>

#### d. EC2에서 docker-compose로 SpringBoot 프로젝트를 실행 시, yml 못 읽는 에러 발생!!

- 문제 발생 : appplication.yml 를 못 읽어서 스프링에서 톰캣 서버가 켜지지 않는 문제가 발생했다. 

<br>
- 해결 방법 : github actions의 yml 설정 파일에 appplication.yml에 들어갈 값을 민감 정보이기에 base64로 인코딩 후  github의 secrets key로 설정!
	- 이렇게 `appplication.yml`파일을 EC2에 직접 주입해야 된다.


---

<br><br>

#### e. EC2에서 메모리 이슈 
- 문제이슈 및 해결방법 : 컨테이너(서버)를 5개 돌리려니까 메모리를 많이 사용해야하므로 속도가 느려져서 Ec2가 빙글빙글 무한히 대기하는 이슈로 먹통되는 문제가 발생!!
	- 이러한 메모리 이슈로 EC2 인스턴스 생성 시, 스펙 증가시키기!!


---

<br><br>

#### e. Nginx 이슈

- 이게 제일 어렵다.. 에러 해결 방법 찾는데 2주 넘게 걸림!!

<br>
- 문제점1 : default.conf를 읽지 못하는 현상 발생 
    - 문제 상황 : Nginx 설정 파일이 경로가 겹쳐서 기존에는 nginx.conf를 Dockerfile에서 추가해주고 docker-compose.yml 컨테이너의 볼륨에서도 추가해줌 
    - 해결 방법 :  docker-compose.yml 컨테이너의 볼륨에서 제거해버림!!
        - A) nginx.conf라는 파일은 `/nginx/nginx.conf`라는 경로가 중요!! : /nginx/nginx.conf`가 nginx의 기본 설정 파일 경로이다. `COPY ./conf.d/nginx.conf /etc/nginx/nginx.conf`
        - B) default.conf라는 파일은 `/nginx/conf.d/default.conf`가 nginx의 기본 설정 파일 경로이다.
      


<br><br>

- a. GitHub Actions 및 EC2 배포 시 고려 사항
	- Dockerfile 내에 복사: GitHub Actions에서 빌드할 때, nginx.conf 파일을 Docker 이미지 내부로 복사하는 방법을 사용하는 것이 가장 깔끔한 방법이다. 이 경우, 배포 시 로컬 경로에 의존하지 않게 된다. 예를 들어, Dockerfile에서 nginx.conf 파일을 복사하도록 설정할 수 있다:

<br>
- `Dockerfile` 실습 코드 : 

```dockerfile
FROM nginx

# Nginx 설정 파일을 Docker 이미지 내부로 복사
COPY ./nginx/conf.d/nginx.conf /etc/nginx/nginx.conf

# 앱 파일 복사 및 기타 설정
COPY --from=builder /app/dist /usr/share/nginx/html
```


- 이렇게 설정하면, GitHub Actions에서 Docker 이미지를 빌드할 때 nginx.conf 파일이 자동으로 포함되며, EC2 서버에서 실행할 때도 해당 파일이 자동으로 컨테이너에 포함됩니다.


<br><br>

- b. Docker Compose 설정 수정
	- 만약 Docker Compose 파일에서 volumes를 사용하여 로컬 파일을 마운트하는 대신, Dockerfile 내에서 복사하는 방법을 선택한다면, volumes 항목을 제거하거나 다른 파일을 마운트하는 데 사용할 수 있다.

<br>
- `yml` 실습 코드 :

```yml
version: '3'
services:
  nginx:
    image: your-nginx-image
    ports:
      - "80:80"
    # 로컬 파일을 마운트하는 대신, Dockerfile에서 복사한 파일을 사용
    # volumes:
    #   - ./nginx/conf.d/nginx.conf:/etc/nginx/nginx.conf
```

<br><br>

- c. 요약 : 

<br>
- 1. Dockerfile 내에서 파일 복사: nginx.conf 파일을 Dockerfile 내에서 복사하도록 설정하면, GitHub Actions를 통해 빌드할 때 이 파일이 자동으로 포함된다.

<br>
- 2. volumes 사용 최소화: 로컬 파일 시스템에 의존하는 volumes 사용을 최소화하는 것이 배포 환경에서 더 안정적이다.

<br>
- 3. 상대경로 사용: 만약 꼭 volumes를 사용해야 한다면, 가능한 한 상대경로를 사용하고, GitHub Actions와 EC2 환경에서 동일한 경로 구조를 유지하도록 한다.

<br>
- 이렇게 하면, GitHub Actions에서 빌드하고 EC2로 배포할 때 경로 문제로 인한 오류를 방지할 수 있다.





- 문제점2 : server_name의 url이 너무 길어서
    * `server_names_hash_bucket_size 128;` 추가해주기!!



---

<br><br>


# 2. Frontend

### 1) Vite + React + Docker 사용기(+ 에러 해결)

#### a. 에러 해결 과정 : 

- docker 개발 환경에서 vite react 프로젝트를 build하여 사용하는 방법은 기존의 webpack을 이용한 react 디렉토리 구조(CRA)를 이용할 것 같았는데 에러가 발생하여 vite용 react 디렉토리 구조로 변경해줘야 도커 환경에서 사용할 수 있다.

<br>

#### b. 디렉토리 구조 설정 : 

- webpack 구조 :
	- public 디렉토리에 index.html과 같은 정적 파일이 포함된다.
	- src 디렉토리에 index.js가 포함된다.
	
<br>
- vite 구조 : 
	- root 디렉토리에 index.html가 포함된다.
	- index.js는 없어도 된다.

<br>
- vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // Here
    strictPort: true,
    port: 3000
  }
})
```

<br>
- 참고 : [docker + vite app 연결하는 과정 : 참고 사이트1](https://stackoverflow.com/questions/71357957/unable-to-map-docker-port-from-vite-app-to-local)


---

<br><br>

# 3. Backend


### 1) JPA : Error creating bean with name 'entityManagerFactory' defined in class path resource 에러


- 에러 로그 : `Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)`


<br>
- 일반적인 해결 방법 : [일반적인 경우의 해결 방법](https://stackoverflow.com/questions/56968183/error-creating-bean-with-name-entitymanagerfactory-defined-in-class-path-resou)
	- import 패키지 문제(jdk 17이라서 jakarta로 변경할 것!)

<br>
- 내가 했던 해결 방법 : 나의 경우는 좀 특별했는데 `build.gradle`에 다음 의존성을 추가해주었다.
	- `java_gradle`(`build.gradle`) : `implementation group: 'org.javassist', name: 'javassist', version: '3.15.0-GA'`
	- `kotlin_gradle`(`build.gradle.kts`) : `implementation("org.javassist:javassist:3.15.0-GA")`
	- [의존성 추가로 인한 해결 방법](https://sean-lets-go.tistory.com/18)

---

<br><br>


### 2) docker-compose에서 SpringBoot 프로젝트 자동 build 설정

#### a. 자동 build 설정을 프로젝트에 적용한 이유 : 

- Docker 개발 환경에서 React 프로젝트가 자동 빌드되도록 하는 과정은 compose 설정에서 바인드 마운트만 추가해주면 간단히 되었지만, SpringBoot 프로젝트의 서버 소스코드를 저장 후 바로 반영이 안되고 다시 컨테이너를 빌드 후 실행을 시키는 과정이 번거로워서 도커 개발환경에서 자동 build를 하려고 했다.


---

<br>

#### b. 동작 과정

- 빌드가 끝나면 .restart 파일 내용이 현재 시간으로 수정됩니다. 그럼 devtools 에서 .restart 파일 변경됨을 감지하고 재시작합니다.

<br>		
- 코드 변경 감지되면 build가 되고, build가 끝나면 buildAndReload 테스크가 실행되어 .restart 파일 수정하고, devtools에서 .restart 파일 수정됨을 감지하여 서버 재시작해주는 방식
	
<br>	
- `getDeps` 태스크는 도커 빌드할 때, 모든 종속성을 다운로드받아서 reload를 더 빠르게 해준다.

---


<br>
#### c. 설정 코드

- entrypoint.sh : 
	- 빌드가 끝나면 .restart 파일 내용이 현재 시간으로 수정되고 devtools에서 .restart 파일 변경됨을 감지하고 재시작을한다.

```sh
#!/bin/bash

start_server() {
  (sleep 30; ./gradlew buildAndReload --continuous -PskipDownload=true -x Test) &
  ./gradlew bootRun -PskipDownload=true
}

start_server
```

<br>
- build.gradle : 
	- 코드 변경 감지되면 build가 되고, build가 끝나면 buildAndReload 테스크가 실행되어 .restart 파일 수정하고, devtools에서 .restart 파일 수정됨을 감지하여 서버 재시작해주는 방식
	- getDeps 태스크는 도커 빌드할 때, 모든 종속성을 다운로드받아서 reload를 더 빠르게 해준다.

```gradle
// 다음 내용 추가
task getDeps(type: Copy) {
	duplicatesStrategy = DuplicatesStrategy.EXCLUDE
	from configurations.compileClasspath into "libs/"
	from configurations.runtimeClasspath into "libs/"
}

task buildAndReload {
	dependsOn build
	mustRunAfter build    // buildAndReload must run after the source files are built into class files using build task
	doLast {
		new File(".", ".restart").text = "${System.currentTimeMillis()}" // update trigger file in root folder for hot reload
	}
}
```

<br>
- Dockerfile : 

```Dockerfile
FROM gradle:6.9-jdk17

WORKDIR /usr/src/spring
COPY . /usr/src/spring
VOLUME /tmp

RUN chmod +x entrypoint.sh && gradle updateLib

EXPOSE 8080

CMD [ "sh" , "entrypoint.sh" ]
```

<br><br>

- 참고 URL : 

- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트1](https://velog.io/@youngjun0627/spring-boot-%EB%8F%84%EC%BB%A4%ED%99%98%EA%B2%BD-auto-reload-%EC%84%B8%ED%8C%85)

- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트2](https://velog.io/@jjh930301/docker-spring-%EA%B0%9C%EB%B0%9C-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%84%B1vs-code)


- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트3](https://stackoverflow.com/questions/59999424/spring-boot-gradle-project-in-docker-with-continuous-build)




---

<br><br>

### 3) JPA : org.hibernate.PersistentObjectException: detached entity passed to persist 에러

- 에러 과정 : 구글링 결과는 연관관계에서 CascadeType.ALL 옵션과 관련된 문제로 해결하려고 했는데 해당 프로젝트에서는 관련 옵션이 존재하지 않아서 다른 방법을 찾아야 했다.

<br>
- 해결 방법 : 엔티티 클래스에 @Id를 부여한 필드에 @GeneratedValue를 작성하여 AUTO, SEQUENCE, IDENTITY 전략 등 데이터베이스에게 key 값을 자동 생성하도록 하는 전략을 선택하였으면서 엔티티 객체 생성 시, Id에 해당하는 필드에 직접 값을 입력하지 않았는지 확인!

<br><br>
- 참고 URL : 

- [참고 사이트1](https://velog.io/@dev-kmson/org.hibernate.PersistentObjectException-detached-entity-passed-to-persist-%EC%97%90%EB%9F%AC)

- [참고 사이트2](https://velog.io/@wnguswn7/Java-JPA-Detached-Entity-passed-to-persist-%EC%97%90%EB%9F%AC)






