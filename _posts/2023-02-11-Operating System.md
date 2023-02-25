---
key: /2023/02/11/Operating-System.html
title: CS - 운영체제(1)
tags: OS SystemStructure ComputerStructure ProgramExecution Process ProcessManagement
---

# 1. Intro

### 1) 요약 :
- 운영체제 개요
- 컴퓨터 시스템의 구조
- 프로세스 관리
- CPU 스케줄링
- 병행 제어
- 데드락
- 메모리 관리
- 가상 메모리
- 파일 시스템
- 입출력 시스템
- 디스크 관리

---

<br>
### 2) 운영체제란 무엇인가?

#### a. 운영체제란? :
- 컴퓨터 하드웨어 바로 위에 설치되어 사용자 및 다른 모든 소프트웨어와 하드웨어를 연결하는 소프트웨어 계층


#### b. 하드웨어와의 인터페이스
- 사용자 및 각종 소프트웨어와의 인터페이스 : 컴퓨터를 편리하게 사용할수 있는 환경을 제공한다.

#### c. 운영체제의 목표
- 운영체제는 동시사용자/프로그램들이 각각 독자적 컴퓨터에서 수행되는 것 같은 환상을 제공한다.
- 하드웨어를 직접 다루는 복잡한 부분을 운영체제가 대신 해준다. 
- 컴퓨터 시스템의 자원을 효율적으로 관리 → 자원관리자
- 프로세서, 기억장치, 입출력 장치 등의 효율적 관리해준다.


---

<br><br>
# 2. Introduction to Operating Systems

### 1)  운영체제란 무엇인가?

#### a. 운영체제란?

- 협의의 운영체제(커널) - 대부분의 전공자 입장에서 개념
	- 운영체제의 핵심 부분으로 메모리에 상주하는 부분

- 광의의 운영체제 :
	- 커널 뿐 아니라 각종 주변 시스템 유틸리티를 포함한 개념

<br>
#### b. 운영체제의 목적
- 컴퓨터 시스템을 편리하게 사용할 수 있게 해준다.
- 운영체제는 동시 사용자/ 프로그램들이 각각 독자적 컴퓨터에서 수행되는 것 같은 환경을 제공(실제로는 아니다.)
- 하드웨어를 직접 다루는 복잡한 부분을 운영체제가 대행
- 컴퓨터 시스템의 자원을 효율적으로 관리
- 프로세서, 기억장치, 입출력 장치 등의 효율적 관리
- 사용자간의 형평성 있는 자원 분배
- 주어진 자원으로 최대한의 성능 도출
- 사용자 및 운영체제 자신의 보호
- 프로세스, 파일, 메시지 등을 관리

---

<br><br>
### 2) 운영체제의 분류

#### a. 동시작업 가능여부에 따른 분류

- 단일 작업(single tasking)
	- 한번에 하나의 작업만 처리
	- MS-DOS 프롬프트 상에서는 한 명령의 수행을 끝내기 전에 다른 명령을 수행시킬 수 없음

- 다중 작업(multi tasking)
	- 동시에 두개 이상의 작업 처리
	- UNIX, MS Windows 등에서는 한 명령의 수행이 끝나기 전에 다른 명령이나 프로그램을 수행할 수 있음

<br>
#### b. 사용자의 수에 따른 분류

- 단일 사용자(single user)
	- MS-DOS, MS Windows

- 다중 사용자(multi user)
	- UNIX, NT server

<br>
#### c. 처리 방식에 따른 분류

- 일괄 처리(Batch Processing)
	- 작업 요청의 일정량을 모아서 한꺼번에 처리
	- 작업이 완전 종료될 때까지 기다려야함
	- ex) Punch Card(천공카드) 처리 시스템

 <br>
- 시분할(Time Sharing)
	- 여러 작업을 수행할 때 컴퓨터 처리능력을 일정한 시간 단위로 분할하여 사용
	- 일괄 처리 시스템에 비해 짧은 응답시간을 가짐(e.g UNIX)
	- Interactive한 방식
	- 정확한 대기시간이 정해져 있지는 않음
	- ex) 일반적으로 우리가 사용하는 OS들(iOS, Window, Android)

<br>
- 실시간(Realtime OS)
	- 보통 특수한 목적을 가진 시스템에서 사용된다.
	- 정해진 시간 안에 어떠한 일이 반드시 종료됨이(Deadline 보장) 보장되어야 하는 실시간 시스템을 위한 OS
	- ex) 원자로/공장 제어, 미사일 제어, 반도체 장비, 로봇 제어

<br>
- 실시간 시스템의 개념 확장
	- Hard Realtime System(경성 실시간 시스템) - 위의 예에 해당되는 시스템들
	- Soft Realtime System(연성 실시간 시스템) - 중단되도 중대한 문제가 발생하지 않는 영상 재생프로그램과 같은 시스템에도 적용가능
		- 요즘 운영체제는 대부분 다중작업, 사용자를 지원하고, 시분할 방식이다.

---

<br><br>
### 3) 몇가지 용어

- Multitasking
	- 여러 작업이 동시에 실행되는 것 처럼 보이는 것

- Multiprogramming
	- 메모리에 여러 프로그램이 동시에 올라가 있음을 강조

- Time sharing
	- CPU의 시간을 분할하여 나누어 쓴다는 의미를 강조

- Multiprocess
	- 여러 작업이 동시에 수행될 수 있다는 의미

- 위 4개의 용어들은 비슷한 의미로 혼용된다.

<br>
- Multiprocessor
	- Multiprocessor는 하나의 컴퓨터에 CPU가 여러개 붙어있음을 의미하는 것이기에 위 용어들과는 구분이 필요(e.g. 고성능 컴퓨터)


---

<br><br>
### 4) 운영체제의 예

<br>
- UNIX
	- 대형 컴퓨터를 위한 운영체제로 시작
	- 코드의 대부분이 C언어로 작성(운영체제, 시스템소프트웨어를 만들기 위해 C언어가 만들어짐)
	- 높은 이식성(Portability) → 전혀 다른 기계어로 작동하는 컴퓨터로 옮길 수 있음
	- 최소한의 커널 구조
	- 복잡한 시스템에 맞게 확장 용이
	- 소스코드 공개(학술적으로 사용하기 용이)**
	- 프로그램 개발에 용이

<br>
- 다양한 버전으로 발전 : 
	- System V, FreeBSD(버클리), SunOS, Solaris
	- Linux(공개 소프트웨어) - 대형 컴퓨터를 위한 것이라고는 하기 어렵다. 여러 환경에서 사용할 수 있게 해주었다. e.g. Android

---

<br>
- DOS(Disk Operating System)
	- 개인용 컴퓨터를 위한 운영체제로 시작
	- MS에서 1981년 IBM PC를 위해 개발
	- 단일 사용자용 운영체제, 메모리 관리능력의 한계(주 기억장치: 640KB)
	- 하지만, 발전속도가 빨라져서 다른 방법이 필요했다. 

<br>
- MS Windows
	- MS사의 다중작업용 GUI 기반 운영체제
	- Plug and Play, 네트워크 환경 강화
	- 불안정성(초창기)
	- 풍부한 지원 소프트웨어
	- Handheld device를 위한 OS
	- PalmOS, Pocket PC(WinCE), Tiny OS

---

<br><br>
### 5) 운영체제의 구조**

- CPU
	- CPU 스케쥴링: 누구한테 CPU를 줄까?의 논리이다. 
	- 먼저 온 사람에게 먼저 권한을 주는 것은 굉장히 비효율적인 논리도 있다. 
	- 결론적인 논리는 CPU를 짧게 시간을 나누어 부분적으로 사용한다.

- 메모리
	- 메모리 관리: 한정된 메모리를 어떻게 분배하지?
	- Working Set 모델? : 집중되는 모델에게 집중해주고 나머지는 디스크를 쫒아 내버린다. 업무가 끝나면 쫒아낸 모델을 다시 불러온다. 
	- 과거의 메모리 관련 데이터와 비교해서 관리하는 경우도 있다.(미래를 예측하는 방법, 친구가 도둑인가?하는 판단)

- 디스크
	- 파일 관리: 디스크에 파일을 어떻게 보관하지?
	- 디스크도 스케쥴링도 필요하다. 헤드가 있어서 먼저들어온것이 먼저 업무를 처리하지 않는다.
	- 어떻게 헤드를 가장 덜 움직이면서 빠르게 효율적으로 업무 처리를 하는 것이 관건이다. 

- 입/출력장치(I/O 디바이스)
	- 입출력 관리: 각기 다른 입출력 장치와 컴퓨터 간에 어떻게 정보를 주고받게 하지?
	- 이것이 속도가 굉장히 느리기 때문에 인터런트를 통해서 관리를 하고 있다.
	- CPU가 방해받지 않도록 인터럽트를 걸어서 업무 처리해준다.

- 프로세스 관리 :
	- 프로세스의 생성과 삭제
	- 자원 할당 및 반환
	- 프로세스 간 협력

- 그 외
	- 보호 시스템
	- 네트워킹
	- 명령어 해석기(command line interpreter)


---

<br><br>
### 6) 운영체제 과목의 수강 태도
- 내가 '운영체제'라고 생각하고 수업을 듣기!
- OS사용자 관점이 아니라 OS 개발자 관점에서 수강해야 함
- 대부분의 알고리즘은 OS프로그램 자체의 내용
- 인간의 신체가 뇌의 통제를 받듯 컴퓨터 하드웨어는 운영체제의 통제를 받으며 그 운영체제는 사람이 프로그래밍 하는 것이다.
- 내가 운영체제라고 생각하고 할 일이 무엇인지를 생각해 보면 이번 배울 내용이 무엇인지 명확히 알 수 있다.

---

<br><br>
# 3. System Structure & Program Execution 1

<br>
### 1) 컴퓨터 시스템 구조

- CPU가 매 클럭 사이클마다 메모리에 있는 기계어(4바이트정도의 인스트럭션)를 하나씩 처리
- 하드디스크는 보조기억장치면서 I/O 디바이스의 역할도 동시에 수행한다.
- CPU는 프로그램 카운터가 가리키고 있는 메모리주소를 계속 읽는역할만 함
- 보통 CPU는 메모리랑만 이야기하지만 I/O랑 이야기할수도(이때 사용되는게 device controller)

<br>
#### a. CPU 구조 :
- CPU가 Disk를 읽어 오라고 Disk Controller에게 시킨다.
- CPU는 쉬지않고 빠르게 여러 가지 다른 일을 한다.(Disk 작업, IO 디바이스 작업)

<br>
- Mode Bit : 이 프로그램이 운영체제인지 사용자 프로그램인지 구분해주는 프로그램이다. 

<br>
- Register : 메모리보다 빠른 공간

<br>
- interrupt : 보통 작업이 끝나면, CPU에게 제어권을 가져가라고 알려준다. 
- Interrupt line : CPU가 라인 하나를 실행할 때마다 Interrupt가 있는지를 체크**

<br>
- timer : 특정 프로그램의 CPU의 독점을 막는 역할
	- 시간이 끝나면 interrupt를 검 
	- CPU가 인스터럭션을 실행하다가 interrupt line을 점검한다.
	- interrupt가 있을 때, CPU는 하던 일을 잠시 멈추고 CPU에게 있었던  제어권이 사용자 프로그램으로부터 운영체제로 자동적으로 넘어간다.
	- 운영체제가 CPU에게 제어권을 줄 때는 그냥 넘어가지만 반대인 경우에는 제어권을 뺐을 수 없다. 인터럽트를 걸어줘야 뺐는데 그런 경우는 CPU의 권한 때문에 존재하지 않는다.
	- 그래서, 등장한 것이 timer interrupt이다. 타이머를 걸어줘서 운영체제에게 제어권을 줄 수 있다.(100ms 정도)
	- 타이머를 걸어주고 타이머가 끝나면, 타이머 인터럽트가 발생한다.
	- timer는 보통 할당된 시간 동안 제어권을 준다. 

<br>
- 결론 : 사용자 프로그램이 I/O 와 직접 소통할수는 없다. 운영체제를 통해서 해야함
 
---
 
<br><br>
#### b. Mode bit
- 사용자 프로그램의 잘못된 수행으로 다른 프로그램 및 운영체제에 피해가 가지 않도록 하기 위한 보호 장치 필요
- Mode bit을 통해 하드웨어적으로 두가지 모드의 operation 지원
-  보안을 목적으로 instruction set을 나눠준다!

<br>
- Mode bit 실행 과정 : 
- Mode bit가 '1' 인 경우, 사용자 모드(제한된 instruction만 지원 - IOS, Windows 등): 사용자 프로그램 수행
	- 사용자 프로그램만이 동작하게 해준다.
	
<br>
- Mode bit가 '0' 인 경우, 모니터 모드(=커널 모드): OS 코드 수행
	- 보안을 해칠 수 있는 중요한 명령어는 모니터모드에서만 수행 가능한 ‘특권명령'으로 규정 → Instruction set을 나눠놓았다?
	- Interrupt나 Exception 발생 시 하드웨어가 mode bit을 0으로 바꿈
	- 사용자 프로그램에게 CPU를 넘기기 전에 mode bit을 1로 세팅


---

<br><br>
### 2) Timer
- 사용자 프로그램에게 CPU 제어권을 넘긴 후, 정해진 시간이 흐른 뒤 운영체제에게 제어권이 넘어가도록 인터럽트를 발생시킴
- 타이머는 매 클럭 틱 때마다 1씩 감소
- 타이머 값이 0이 되면 타이머 인터럽트 발생
- CPU를 특정 프로그램이 독점하는 것으로부터 보호 → 타이머는 time sharing을 구현하기 위해 널리 이용됨 → 타이머는 현재 시간을 계산하기 위해서도 사용

---

<br><br>
### 3) Device Controller
- 메인 메모리는 CPU만 접근하고 / 디바이스 컨트롤러는 로컬 버퍼까지만 접근

<br>
#### a. I/O device controller
- 해당 I/O 장치유형을 관리하는 일종의 작은 CPU
- 제어 정보를 위해 control register, status register를 가짐(CPU가 일을 명령하기 위해)
- 실제 담은 데이터는 버퍼에 담고 실제 제어 지시는 제어 레지스터가 한다.  **
- local buffer를 가짐 (일종의 data register) (메모리의 데이터를 버퍼에 담은다음에 화면에 출력하거나 저장)
- I/O는 실제 device와 local buffer 사이에서 일어남
- Device controller는 I/O가 끝났을 경우 interrupt로 CPU에 그 사실을 알림 비교해봅시다.

<br>
#### b. device driver (장치 구동기)
- 하드웨어에 접근하기 위해 설치해야함 
- 디바이스 드라이버는 CPU가 지시하고 펌웨어를 통해 매뉴얼대로 일을 한다.
- 실제 디바이스가 실행하는 인스트럭션인 펌웨어 와는 구분되어야함
- OS코드 중 각 장치별 처리루틴 → software
- 하드웨어에 접근하기 위해 설치해야함

<br>
#### c. Device Controller(장치 제어기)
- 각 장치를 통제하는 일종의 작은 CPU → hardware
 
---

<br><br>
### 4) DMA(Direct Memory Access)
- 메인 메모리에 직접 접근할수 있음
- 동시에 CPU와 메모리에 접근할때를 조율하기 위해서 memory controller이다. 그래서, I/O가 너무 많아서 중재 해주는 역할이다.
- 목적** : I/O가 너무 많은 intrrupt를 발생시킬 수 있기에 중간중간 발생하는 Local buffer의 내용을 복사해서 한번에 메모리에 올려서 CPU로 알려줌.()

<br>
#### a. 입출력(I/O)의 수행
- 모든 입출력 명령은 특권 명령
- 사용자 프로그램은 어떻게 I/O를 하는가??

---

<br><br>
### 5) 시스템 콜(System Call)

- 사용자 프로그램은 운영체제에게 I/O 요청(함수 요청을 하는 것인데 일반 함수와는 다르다.)
- C언어 코딩이라면, CPU가 절차적 코드에 제어문이나 함수 호출을 하면 그 부분으로 점프한다. 
- 또한, IO를 하기 위해서는 운영체제에 관련 주소로 점프해야 한다. 
- instruction이 실행되면, CPU는 interrupt를 실행한다.

<br>
- 프로그램이 직접 소프트웨어적으로 '소프트웨어 인터럽트'('트랩')를 요청 → 운영체제로 제어권 넘어감
- trap을 사용하여 인터럽트 벡터의 특정위치로 이동
- 제어권이 인터럽트 벡터가 가리키는 인터럽트 서비스 루틴으로 이동
- 올바른 I/O 요청인지 확인 후 I/O 수행
- I/O 완료 시 제어권을 시스템콜 다음 명령으로 옮김

<br>
- 결론** : I/O를 하기 위해서 인터럽트가 2개 걸린다. 처음에는 사용자 프로그램이 I/O를 요청하기 위해서 OS에게 시스템 콜을 한다. 처음 I/O 요청 시에는 '소트트웨어 인터럽트'가 걸린다. 그 다음에 OS가 일을 하라고 시킨다. 시킨 일이 다 끝나면 '하드웨어 인터럽트'가 걸린다. '하드웨어 인터럽트'에 의해서 일을 다 했다고 CPU에게 알려준다. 이렇게 제어권을 주고 받는다. 
	- 결국, I/O 사용을 위해서 2가지 인터럽트가 다 필요하다!


<br>
#### c. 인터럽트 관련 용어**

<br>
- Interrupt(인터럽트) :
	- 인터럽트 당한 시점의 레지스터와 Program Counter를 Save 한 후 CPU의 제어를 인터럽트 처리 루틴에게 넘긴다.
	- CPU는 매 클럭마다 인터럽트 들어온게 있는지를 확인함 

<br>
- 인터럽트의 개념 종류 : 

<br>
- 넓은 의미의 인터럽트 : 
	- 하드웨어가 발생시킨 인터럽트
<br>
- 좁은 의미의 Interrupt : (타이머, I/O 컨트롤러)에도 인터럽트가 있다.
	- Trap(소프트웨어 인터럽트)
		- Exception: 프로그램이 오류를 범한 경우
		- System Call: 프로그램이 커널 함수를 호출하는 경우

---

<br>
- 인터럽트의 종류 :

<br>
- 벡터(인터럽트 '처리 루틴'의 '주소'를 갖고 있음) → 인터럽트 처리 루틴 → 인터럽트 처리

<br>
- 인터럽트 벡터 : 
	- 해당 인터럽트의 처리 루틴 주소를 가지고 있음
	- 각 인터럽트에 해당되는 작업을 어느 커널함수에서 해야하는지를 나타내는 테이블 같은 개념

<br>
- 인터럽트 처리 루틴(Interrupt Service Routine, 인터럽트 핸들러) :
	- 해당 인터럽트를 처리하는 커널 함수

---
 
<br><br>
### 6) System Call
- 정리 : 사용자 프로그램이 운영체제의 서비스를 받기 위해 커널 함수를 호출하는 것(Trap)





---






<br><br>
# 4. System Structure & Program Execution 2


- 요약 : I/O 작업, exception 이 났을때 process는 trap(interrupt)을 걸어 os 에게 cpu 를 넘긴다.
- CPU가 아주 빠른 일꾼이다. Instruction(기계어)를 읽어서 실행된다. 그사이에 인터런트가 들어온 것을 매번 확인해서 운영체제에게 CPU 제어권을 넘겨 준다.
 
---

<br>
### 1) synchronous IO :

- 동기식 입출력 방법 구현 방법 1:
	- 사용자 process 에서 io 가 발생하면 cpu 가 os 에게 넘어감
	- os 는 io 명령을 수행하고 io 응답이 올 때 까지 기다림(cpu 는 아직도 OS에게 있음)**
	- io 응답이 오면 그제서야 사용자 process memory 에 결과를 넣고
	- 사용자 process 에게 cpu 를 돌려줌.
	- cpu 낭비가 엄청나다. 또한 매시점 하나의 io 만 일어나기 때문에 다른 io 디바이스들도 노는 꼴이 됨.

<br>
- 동기식 입출력 방법 구현 방법 2:
	- 그래서, io 명령을 수행한 후 응답을 기다리지 않고, 다른 process 에게 cpu 를 넘겨준다고 함.
	- cpu (와 io 디바이스들)가 놀지 않게 하기 위해.
	- io 응답이 오면 사용자 process memory 에 결과를 넣고
	- (다른, 혹은 io를 발생시킨) process 에게 cpu 를 돌려줌.


---

<br><br>
### 2) asynchronous IO :

- A라는 사용자 process 에서 io 가 발생하면 cpu 가 os 에게 넘어감
- os 는 io 명령을 수행하고, io 응답이 오는 걸 기다리지 않고 바로 A process 에게 다시 cpu 를 넘김
- io 응답이 오면 interrupt 가 걸리고, os 는 해당 처리를 한 다음 다시 A process 에게 cpu 를 넘김.

 
<br>
- **정리 : 예로 들어 쉽게 설명하자면, 동기식 입출력은 io 를 요청한 후 process가 멈춤. io 응답이 오면 그제서야 process가 계속됨.
- 여기서 process 가 계속 멈춰있으면 cpu 가 놀게 되니까, 그 때 다른 process 에게 cpu 를 줄 수 있음.
- 비동기식 입출력은 io 를 요청한 후 응답이 오든 말든 process 는 다음 명령을 계속 수행함.
- io 응답이 오면 응답 결과를 가지고 다시 일처리를 하겠지.

---
 
<br><br>
### 3) DMA  작동 과정 :

- 컴퓨터에 DMA(Direct Memory Access) 라는 장치가 있음.
- io 디바이스들이 하도 cpu 에 interrupt 를 여러 번 거니까 cpu 효율이 나빠짐.
- DMA는 cpu가 받는 io interrupt 들을 자신이 받아 미리 처리하고(memory에 io 응답값을 넣는 등)
- cpu에게는 "일을 내가 거의 끝내놨다. 너는 마무리 작업을 해라" 라고 말하며 cpu 에게 한 번만 interrupt 를 걸어줌.
- 이렇게 cpu 의 부담을 줄여주는 것이 DMA.


<br>
- 예를 들어, 키보드의 키 하나를 누르면 1byte 정보가 키보드 버퍼에 쌓이고
- 키보드의 device controller가 cpu에 interrupt를 걸어
- 메모리 내로 방금 생성한 1byte 정보를 복사하라고 요청
- 이런 방식으로 키보드를 사용하면 수많은 interrupt 들이 생성될텐데,
- 이 interrupt 들이 계속 cpu 를 방해하면 성능이 떨어짐.

<br>
- DMA는 이런 상황에서 필요함.
- DMA는 키보드에서 생성한 1byte 에 대한 interrupt 를 자신이 받아서 메모리에 직접 정보를 넣음.
- 메모리에 넣은 정보가 특정 단위(페이지 혹은 블럭)를 넘어서면 그제서야 DMA 가
- cpu에게 "네가 할 일 내가 미리 끝내놓음. 나머지 작업 네가 처리하셈" 라고 말하며
- cpu에게 한 번 interrupt 를 걸어줌. DMA 덕분에 cpu 가 interrupt 당하는 빈도가 줄어 성능이 향상됨.
- DMA는 메모리에 직접 접근이 가능함(그래서 io 응답 처리가 가능함)


---

<br><br>
### 4) 프로그램 절차 :

- 아래는 프로그램이 어떻게 실행되는지 그 절차를 설명함.
- 프로그램은 실행파일 형태(binary)로 disk 에 저장되어 있음.
- 프로그램이 실행되면 프로그램의 binary 가 memory 에 올라가게 됨.
- memory 에 올라갈 때, 각 프로그램들은 memory에 각자의 memory 공간을 할당받게 됨.(프로그램이 memory 에 올라가 있어야 cpu 가 실행할 수 있으니까)
- memory 공간은 주소를 갖고 있음
- 각 프로그램들이 할당받은 공간의 주소는10, 

<br>
- 예를 들어,
- 프로그램A는 2553~6754 이고 프로그램 B는 88552~91502, 12204~53582, 이렇게 예쁘지 않은 주소 공간임. 게다가 나란히 존재하지 않고 쪼개져 있을 가능성이 농후함.
- 하지만 각 프로그램 입장에서는 아주 예쁘게 0부터 1024 처럼 정렬된 공간처럼 보임. 이것이 virtual memory. 
- 프로그램은 자신을 실행시키기 위해 할당받은 메모리 공간에 code, data, stack 영역으로 나눈 후 각 영역의 역할에 맞게 사용.


<br>
- code : cpu 에서 실행할 기계어 코드를 넣음.
- data : code 에서 실행할 전역변수 등을 넣는 영역으로 사용.
- stack : code 가 동작할 때 사용하는 stack 영역(함수를 실행하는 데 사용하는 stack 영역) 으로 사용.

<br>
- 흔히 쓰이는 JAVA 프로그램의 경우 할당받은 메모리 공간을 메소드, 스택, 힙 영역으로 나눠서 사용.
- 각 프로그램이 할당받은 메모리 공간이 모두 memory 를 차지하고 있지 않음(모두 메모리에 올라가 있지 않음)
- 각 프로그램에서 실제 사용해야 하는 부분만 메모리에 올림. 다 올리면 프로그램에서 안 사용하는 부분까지 올라가게 되어 메모리가 낭비되니까. 
- 그럼 메모리 공간에 올라가지 않은 나머지 프로그램부분은 어디에 있을까? 아직 disk 에 있다.
- 즉, disk 에서 프로그램이 실행을 위해 필요한 부분만 읽어 메모리에 넣은 다음 cpu 를 통해 실행시키는 것.

<br>
- 다르게 말하면, 메모리에 올라가 있는 프로그램 부분 중에 안 사용하는 부분은 메모리에서 내려와서 다시 disk 로 돌아감
- 커널 역시 프로그램(상시 돌아가는 process)이기 때문에 자신의 메모리 주소 공간을 갖고 있음. 위 이미지에서 흰 색 박스 부분.



---

<br><br>
### 5) 커널  
- 커널은 os 라서 중요하니까 커널의 주소 공간 내용을 구체적으로 살펴보자.
- 커널의 코드 부분에는 다음과 같은 코드들이 들어있음.
- 각 interrupt 를 처리하기 위한 코드(interrutpt 처리 루틴) 
- 자원 관리를 위한 코드
- 사용자에게 제공하는 인터페이스 코드

 
<br>
- data 부분에는 cpu, memory 등 자원 관리하기 위한 자료구조 들이 들어있음.
- 또한, 동작하는 process 들을 관리하기 위한 자료구조(PCB) 들이 들어있음.
- 예를 들어, process A가 cpu 를 얼마나 썼는지, 다음 process 에게 메모리는 얼마나 줘야 하는지 등
- 이걸 보고 PCB(Process Control Block) 이라고 함.

- 즉, 프로그램마다 PCB 가 하나씩 만들어져서 os 가 관리함. 그리고 그것이 data 영역에 들어있음.


<br>
- os(kernel) 역시 함수 구조로 짜여있기 때문에 함수나 return 등의 구조를 사용하기 위한 stack 영역을 사용.
- 사용자 process 들이 os 에 system call 을 하면 그것을 각 process 당 커널 스택으로 정리함.
- 예를 들어 process A 가 system call 을 하고 process B 역시 system call 을 하면
- 그것들을 각 process 에 맞게 process A 의 커널스택, process B 의 커널스택으로 관리한다고 함. 솔직히 이해는 안 가는데 자세한 내용을 뒤에서 한다고 함.

 
---

<br><br>
### 6) 함수
- 프로그램은 함수로 이루어짐.
- C로 짜든 JAVA 로 짜든 프로그램은 함수로 구성됨.
- 프로그램을 구성하는 함수는 총 세 가지 종류가 있음.

 
<br>
- 함수의 종류 :
	- 사용자 정의 함수 : 코드 내에 사용자가 직접 만든 함수. myfunc 같은 것이다.
	- 라이브러리 함수 : 라이브러리를 통해 불러온(import) 함수 혹은 내장 함수.
	- 커널 함수 : os 가 정의함, os 프로그램의 함수. 즉 system call.

<br>
- 예를 들어, 'read'라는 함수를 실행하면 해당 path의 file을 읽어달라는 명령이 실행되는데
- 이 때, system call이 불림. 이 system call 에 의해 실행되는(실질적으로 device에 가서 읽는) 함수는 os에서 제공해주는 함수임.

<br>
- 사용자 정의 함수, 라이브러리 함수는 process가 할당받은 메모리 공간의 code 영역에 들어감.
- 커널 함수는 os이 갖고 있는 kernal 메모리 공간의 code 영역에 들어감.
- 따라서, 사용자 정의 함수, 라이브러리 함수를 실행할 때는 cpu interrupt 가 걸리지 않고 자기 메모리 공간 내에서 계속 실행이 가능
- 커널 함수(system call)를 실행할 때는 interrupt 가 걸림.

---


<br><br>
# 5. Process 1

### 1) Process 개념

- process 란 실행중인 프로그램임. 

<br>
- process 의 context 는, 현재 실행중인 process 가 어떤 상태에 있고 어디까지 실행했는지 등을 나타냄.
- process는 메모리에 개인 주소 공간을 갖고 있고 이곳에 코드(기계어)를 올림.
- PC(Program Counter) 가 process 의 실행 코드(기계어) 어느 부분을 가리킴
- PC가 가리키는 부분에서 코드(기계어)를 읽어서 CPU 안의 레지스터에 저장한 후 ALU(산술 논리 연산장치)에서 처리함.
- 그 결과를 레지스터에 다시 저장하거나 혹은 메모리에 다시 저장함.

---

<br>
### 2) Process Context 개념

- 따라서, 현재 process 가 어디까지 실행했는지 알기 위한 context 를 위해, pc가 어디를 가리키는지, 메모리 주소 공간에 어떤 코드와 어떤 함수, 어떤 데이터를 올려두었는지 CPU 레지스터에는 어떤 값을 저장하고 있는가 등을 알아야 함.
- 이렇게 process 의 현재 상태를 알 수 있는 것을 'Context'라고 함.

<br>
- Context는 아래 세가지로 나타낼 수 있음.
	- CPU 수행 상태를 나타내는 하드웨어 문맥
	- CPU 내의 PC(program counter)
	- CPU 내의 각종 레지스터들

---

<br>
### 3) Process 메모리, 커널 구조
- 프로세스의 메모리 주소 공간
	- Code, Data, Stack 으로 나타내어지는 공간들

<br>
- 프로세스 관련 커널 자료 구조
- PCB(Process Control Block) : process 를 관리하기 위해 os 가 갖고 있는 자료구조. 
- OS의 메모리 주소공간 data 영역에 process 별로 하나씩 갖고 있음.
- 어떤 process 에게 메모리를 얼마나 줘야 할지, cpu는 얼마나 줘야 하는지 등을 관리
	- Kernel Stack : process 가 system call 을 했을 때 실행되는 os 함수의 stack 영역
	
<br>
- 커널도 함수로 실행되기 때문에 I/O 등의 System Call을 함수로 실행.   
- 따라서, 함수가 쌓이는 stack 영역에 실행 함수를 쌓아둠.
- 이 때, PC는 process 의 code 를 가리키지 않고 os 의 코드를 가리킴(실행하는 system call 함수 부분)
- process별로 스택을 다르게 둠. 이를테면 A process 가 실행하는 system call 
- stack은 23번지에, B process가 실행하는 'System Call Stack'은 6674번지에 쌓는 등.

      

---

<br>
### 4) Process 과정
- process 는 크게 세가지 상태를 갖음.
	- Running : 현재 CPU 를 잡고 명령을 수행중인 상태
	- Ready : CPU 를 기다리는 상태. CPU 만 잡으면 바로 명령 수행이 가능함. 즉, io waiting 이나 메모리에 코드 올리는 기타 작업들을 이미 모두 마쳐둔 상태.
	- Blocked( wait, sleep ) : CPU 를 주어도 명령 수행을 할 수 없는 상태. io 응답을 기다리고 있거나, 메모리에 실행 코드가 바뀌어 올라오고 있을 때(기존 것을 버리고 새로 실행할 코드를 올릴 때) 등

<br>
- 이 외 다른 상태도 있음.
	- New : 프로세스가 초기에 생성중인 상태
	- Terminated : process의 모든 명령 수행이 끝난 상태. 메모장을 닫으면 Terminated 상태가 되겠다.
	- Suspended (stopped) : 외부적인 이유로 process 의 수행을 정지한 상태.  메모리에서 process 의 메모리값들을 모두 disk 로 내쫓은(swap out) 상태. 즉, 메모리에 페이지가 전혀 올라와 있지 않은 상태

<br>
- 예를 들어, 메모리에 너무 많은 process 가 올라와 있는 상황에서
- 시스템이 process 를 잠시 중단시키기 위해 Suspended 상태로 만든다고 함. 혹은 linux 에서 process 실행중에 Ctrl+Z 를 눌러서 일시정지 시키는 것이 Suspended 라고 함)

- Blocked 와 Suspended 상태가 헷갈릴 수 있음.
- Blocked 는 자신이 요청한 event 가 만족되면 Ready 가 갈 수 있음.

<br>
- 또한, 메모리에 process 가 올라와있음. Suspended 는 외부에서 resume 해 주어야 Active 가 된다고 함. 
- 메모리에 process 가 올라와있지 않음.

---

<br>
- 참고로, process 가 system call 를 통해 os 에게 cpu 를 넘겼을 때 "OS가 Running 상태에 있다" 라고 표현하지는 않음.
- 단지 유저모드에서 커널모드로 넘어갔다, 커널모드에서 running 하고 있다 라고만 말 함.
- 위의 이미지에서도 user mode Running 에서 system call, trap 이 발생하면, monitor mode Running 이 되는데 이것을 os 가 running 한다 라고 말 하지 않음.
- 왜냐면 system call 을 발생시킨 현재 process 가 아직 running 중이란 것을 전제로 하기 때문에.

 
---

<br>
### 5) Process Queue 과정

- OS는 자신의 메모리 주소 data 공간에 Process의 상태에 해당하는 process 큐를 하나씩 만들어 둠.
- 예를 들어, running 상태의 process 를 위한 공간
- Ready 상태를 위한 큐(cpu 자리가 비면 바로 큐에서 하나 뽑아서 cpu 에 넣을 수 있도록)
- Blocked 상태를 위한 큐(어떤 큐는 키보드 입력을 받는 프로세스를 넣는 큐,
- 어떤 큐는 File IO를 기다리는 프로세스를 넣는 큐,
- process 끼리 공유하는 데이터에 대해, 일관성을 위해 한 번에 하나의 process 만 접근 가능한
- 정책이 시행중일 때, 공유 데이터를 얻기 위해 기다리고 있는 프로세스를 넣는 큐 등)

 
<br>
- 위에 그림에서는 일반 큐처럼 그려놓았지만,
- 사실은 process priority 를 기준으로 하는 우선순위 큐임.
- 즉 우선순위가 높은 프로세스부터 큐에서 빠져나옴.
- 물론 이건 정책에 따라 달라짐.
- 일반 큐처럼 하는 것은 round robin 방식이지. 
- os 는 (위에서 말한 것 처럼) PCB 를 통해 process 를 관리함.
- 각 process를 관리하기 위해 process 당 유지하는 정보가 PCB 에 저장됨.

---

<br>
### 6) PCB

- PCB 에 저장하는 데이터는 다음과 같음

<br>
- os 가 관리상 사용하는 정보
	- process status(running, ready 등)
	- process ID
	- 스케줄링 info
	- priority : 큐에서 먼저 실행되어야하는 순서

<br>
- CPU 수행 관련 하드웨어 값
	- PC, CPU 의 레지스터들

<br>
- 메모리 위치 정보	
	- code, data, stack 의 위치 정보. code data stack 이 메모리의 어디 위치해있는지.
	
<br>
- 파일 관련 정보
	- open file descriptors... 등 해당 process가 사용중인 파일이 어떤건지.

---

<br>
### 7) 헷갈리기 쉬운 내용 정리 

- Context Switching 을 하기 위해 기존 process A의 정보들(pc, memory 위치 정보, 레지스터 값 등)을
- os가 관리하는 데이터 영역내, process A를 위한 pcb 자리에 저장(백업)함.
- 그 후 process B 의 pcb 정보들을 cpu와 메모리 등에 올리고 process B 를 실행

 
<br>
- 헷갈리기 쉬운 것 중 하나는,
- 사용자 process 가 실행중인 상태에서 하드웨어 interrupt(timer 가 아닌 interrupt)나 system call등에 의해
- cpu 를 os 에게 넘기는 것은 context switching이 아니라고 함.
- 왜냐면 os 가 일을 처리한 후 다시 방금까지 실행중이던 process에게 cpu 를 줄 것이기 때문에.

 
<br>
- 반대로 timer interrupt 나 io 요청 system call 을 하는 process 는 cpu 를 놓고
- 다른 process 에게 cpu를 넘겨야 하기 때문에 context switching 이라고 부름.

---

<br>
### 8) 추가 정보

- 첫번째 케이스에서 cpu가 os에게 넘어갔을 때 역시 process의 정보들이 pcb 에 담기고
- os의 정보값들이 cpu에 담기는 절차(context switching 이 일어날 때 교환되는 절차들)가
- 발생할 것 같은데... 어쨌든간에 cpu를 사용하기 위해선 process든 os든 정보를 cpu에 넣어야 할 것 아닌가? 

<br>
- os가 cpu 레지스터 사용 없이 실행될리 만무하고 그럼 첫번째 케이스가 context switching이라고 불리지 않는 이유는 
- 단지 논리적으로 process가 다른 process로 바뀌지 않기 때문인가? 실제로 벌어지는 일은 똑같은데?
-> 교수님이 이어서 해주신 설명에 해당 내용이 있음.

<br>
- process에서 os로 cpu가 넘어갈 때 물론 정보 백업 등이 일어나고 context switching 절차가 발생하기는 하지만, 그 overhead가 일반 context switching보다 적다고 함.

<br>
- 예를 들어, cpu내의 cache memory를 보자.
- 일반 context switching이 일어나면 다른 process 로 바뀌기 위해 현재 cache memory가 모두 flush되어야 함. 이것은 상당한 overhead라고 함
- 근데 (위에서 말하는 첫번째 케이스) os로 CPU가 넘어가는 경우는 cache memory flush가 일어날 필요가 없기 때문에(다시 해당 process에게 cpu 를 돌려주기 때문) 오버헤드가 적음
- cache memory flush 절차를 생략하고 os에게 cpu가 넘어감. 그리고 다시 해당 procss에게 cpu가 넘어가겠지. 
- 이런 overhead가 적기 때문에 context switching이라고 부르지 않는가 봄.

---
 
<br>
- 위에서 설명한 큐를 나타내는 이미지.
- 여기서 말하는 큐는 os의 메모리 주소 data 공간에 process 들을 상태별로 관리하기 위해 만들어둔 것이라고 설명하였음.

<br>
- 위에 이미지를 보면 상태별로, 그리고 device별로 큐가 구현되어있는 것을 볼 수 있음.
- 어떤 process는 ready에 들어가 있고, 어떤 process는 disk에 들어가 있고...
- 여기서 큐에 들어가는 것은 process를 관리하기 위해 만들어진 pcb임. pcb를 큐에 넣어서 관리함.
- (pcb는 context switching을 통해 해당 process를 되살릴 수 있는 정보들을 갖고 있다. 따라서, pcb를 큐에 넣고 저장한다는 것은, 해당 process의 context를 지닌 정보를 큐에 넣고 저장한다는 것과 일맥상통)


---

<br><br>
# 6. Process 2

<br>
### 1) Thread 란? 
- thread 란 process 내부에 cpu 수행 단위
- “A thread(or lightweight process) is a basic unit of CPU utilization”

--- 

<br>
### 2) Thread의 구성 
- Program Counter
- Register Set
- Stack Space
 
--- 

<br>
### 3)  Thread가 동료 Thread와 공유하는 부분(=Task)**
- Code Section
- Data Section
- OS Section
 
--- 

<br>
### 4)  Thread 구성 
- 전통적인 개념의 heavy weight process는 하나의 thread를 가지고 있는 task로 볼 수 있다.
- process 내부에서 똑같은 code 를 가지고 동시에 여러 작업을 하기 위해,
- thread 개수에 맞춰 pc(program counter) 를 여러개 둠.
- pcb에서 pc와 해당 pc 위치에서 실행되는 코드에서 사용하는 레지스터가 여러개 생기겠지.


--- 

<br>
### 5)  Thread 장점 및 정리
- Thread는 Program Counter와 레지스터를 여러 개 두어서 코드의 실행부분을 나누는 것임. 
- 스택도 별도로 메모리 주소공간을 공유 
- 프로세스 상태도 공유
- 프로세스가 사용하는 각종 자원들도 공유
- CPU수행과 관련된 정보만 공유하지 않음!!!

<br>
- 다중 스레드로 구성된 태스크 구조에서는 하나의 서버 스레드가 blocked(wating) 상태인 동안에도 동일한 태스크 내의 다른 쓰레드가 실행(Running)되어 빠른 처리를 할 수 있다.(=비동기처리?)
- 동일한 일을 수행하는 다중 쓰레드가 협력하여 높은 처리율(throughput)과 성능 향상을 얻을 수 있다.(주소공간=메모리를 공유하므로 자원절약을 할 수 있어 효율이 좋음!)
- 쓰레드를 사용하면 병렬성을 높일 수 있다.(CPU가 여러개 달린 컴퓨터에서만 가능)


---

<br><br>
# 7. Process 3

<br>
### 1) 쓰레드의 장점
 
<br>
#### a. Responsiveness(응답성)
- multi-threaded Web - if one thread is blocked (e.g. Network) another thread continues (e.g. Display)
- 웹브라우저의 html에서 텍스트를 먼저 보여주고 이미지를 나중에 보여주는 과정(텍스트와 이미지를 비동기식으로 처리) 
- 이렇게 하면, 사용자에게 답답함을 줄여준다!

<br>
#### b. Resource Sharing(자원 공유)
- n threads can share binary code!, data!, resource of the process

<br>
#### c. Economy
- Creating & CPU switching thread(rather than a process)
- Solaris의 경우 프로세스를 생성하는 경우와 스레드를 CPU 스위칭할 때, overhead가 각각 30배, 5배 정도 차이가 난다. 
- 프로세스 하나를 생성하고 CPU를 스위칭하는 것보다 스레드 사이에서 CPU 스위칭은 오버헤드가 적다.

<br>
#### d. Utilization of MP Architectures(CPU가 여러개 있는 환경에서만)
- MP = Multi-Processor
- each thread may be running in parallel on a different processor
 
--- 
 
<br>
### 2) 쓰레드의 구현

- '커널 쓰레드'는 커널이 쓰레드를 관리하며, 쓰레드가 몇개 있는지는 운영체제가 알고 있다, 다른 쓰레드로 넘기는것도 커널이 넘김
- '유저 쓰레드'의 경우는 운영체제(커널)가 쓰레드가 몇 개 있는지 쓰레드에 대한 정보를 알지 못하고 라이브러리를 지원받아서 구현된다. → 구현상에 제약이 있을 수가 있음(유저용 쓰레드임.)
- 추가적으로 'Real-Time Threads'도 있다. 



---


<br><br>
#  8. Process Management 1

### 1) 프로세스 생성 방법

- 부모 프로세스가 자식 프로세스를 만든다.
- 프로세스는 복제 방법을 이용한다.
- 족보는 트리형태로 만들어 진다. 
- 자원을 공유하는 모델도 있고 아닌 모델도 있다. 보통은 공유하지 않고 경쟁하는 모델이 일반적이다.

---

<br>
#### a. 수행

부모, 자식 공존하며 수행되는 모델
자식이 종료(terminate)될 때까지 부모가 기다리는(wait -> blocked 상태) 모델

<br>
#### b. 주소 공간

자식은 부모의 공간을 복사함 (ex. 운영체제에 있는 data들 (PCB, 자원) == binary and OS data)
자식은 그 공간에 새로운 프로그램으로 덮어씌울 수 있음

<br>
#### c. 유닉스의 예(fork, exec의 시스템 콜)

<br>
- fork() 시스템 콜이 새로운 프로세스 생성
	- 부모를 그대로 복사 (PID를 제외한 OS data + binary)
	- 주소 공간 할당

<br>
- exec() 시스템 콜
	- fork() 다음에 이어짐
	- 새로운 프로그램을 메모리에 올림 (다른 프로그램으로 덮어 씌움)
	- 복제만 해놓고 덮어 씌우지 않을 수도 있음
	- 자식 프로세스 만들지 않고 exec() 하면 새로운 프로세스로 바꿀 수도 있음!!
	 

--- 

<br>
### 2) 프로세스 종료 방법

#### a. 일반적인 프로세스 종료(exit!!) : 
- 프로세스가 마지막 명령을 수행한 후 운영체제에게 이를 알려줌 (exit - 프로세스 종료시킴)
- 자발적으로 프로세스 종료할 때
- 자식이 부모에게 output data를 보냄 (wait 시스템 콜을 통해서)
- 프로세스의 각종 자원들이 운영체제에게 반납됨
- 보통, 프로세스 생태계에서는 자식 프로세스가 먼저 죽고 그다음에 부모 프로세스가 죽는다. 

<br>
#### b. 강제 종료 시키는 방법 : 
- 부모 프로세스가 자식의 수행을 종료시킴 (abort)
- 비자발적으로 프로세스 종료할 때
- 자식이 자원의 한계치를 넘어선 요청을 할 때
- 자식에게 더 이상 시킬 일이 없음

<br>
#### c. 부모가 종료(exit)되는 경우	 : 
- 운영체제는 부모 프로세스가 종료하는 경우, 자식이 더 이상 수행되도록 두지 않음
- 단계적인 종료가 일어남

---

<br><br>
#  9. Process Management 2

<br>
- Copy-on-write (cow)
- write가 발생했을 때 그 때 copy하겠다.
- write: 원래있던 내용을 바꾸는 것
- copy: 부모의 code, data, stack 복사
- write가 발생하기 전까지는 부모 자원 공유

---

<br>
### 1) fork() 시스템콜

```cpp
int main()
{
	int pid;
  pid = fork();
  if (pid == 0)  /* this is child */
    	printf("\n Hello, I am child!\n");
  else if (pid > 0) /* this is parent */
    	printf("\n Hello, I am parent!\n");
}
```

<br>
- fork() : 자식 만들어짐!
- 자식에서는 fork()를 실행한 그 이후 시점부터 실행됨!
- 부모의 context가 복사되므로 program counter 값도 복사되니까!
 
---
 
<br>
### 2) exec() 시스템콜


```cpp
int main()
{
	int pid;
  pid = fork();
  if (pid == 0) { /* this is child */
    	printf("\n Hello, I am child! Now I'll run date \n");
    	execlp("/bin/date", "/bin/date", (char *)0);
  }  
  else if (pid > 0) /* this is parent */
    	printf("\n Hello, I am parent!\n");
}

```

---

<br>
### 3) execlp
- exec 시스템 콜을 함
- 이전의 기억을 지우고 새로운 프로그램으로 덮어씌워짐
- 새로운 프로그램의 시작 부분부터 실행됨
- 다시 돌아갈 수 없음 (새로운 프로그램 실행 다 하면 수행 끝!)
 
```cpp
int main() {
	printf("\n Hello, I am child! Now I'll run date \n");
  execlp("/bin/date", "/bin/date", (char *)0);
  printf("\n Hello, I am parent!\n"); // 이 코드는 실행 불가능!!!!!!!!!
}
```

---

<br>
### 4) fork, exec, execlp 정리
- fork() 안하고 exec()
- execlp(" ", " ", ~~~~, (char *) 0);
	- 프로그램 이름 두번, 전달할 argument (""로 구분), 마지막엔 (char*)0
 
```cpp
int main() {
	printf("1");
  execlp("echo", "echo", "hello", "3", (char *)0);
  printf("2");
}
```

<br>
- 출력

```
1
hello 3
```

---

 
<br>
### 5) wait() 시스템 콜
- 프로세스 A가 wait() 시스템 콜을 호출하면
- 커널은 child가 종료될 때까지 프로세스 A를 Sleep시킴 (block상태)
- 자식이 종료되기를 기다리며 block 상태가 되는 것
- 자식 프로세스가 종료되면 프로세스 A를 깨움 (ready상태)
- 부모가 block 상태 → ready 상태로 바뀜 (CPU를 얻을 수 있게 됨)
 


---

 
<br>
### 6) exit() 시스템콜

<br>
#### a. 프로세스의 종료 방법 :

<br>
- 자발적 종료
	- 마지막 statement 수행 후 exit() 시스템콜을 통해
	- 프로그램에 명시적으로 적어주지 않아도 main 함수가 리턴되는 위치에 컴파일러가 넣어줌
	
<br>
- 비자발적 종료
	- 부모 프로세스가 자식 프로세스를 강제 종료시킴
	- 자식 프로세스가 한계치를 넘어서는 자원 요청
	- 자식에게 할당된 태스크가 더 이상 필요하지 않음
	- 키보드로 kill, break 등을 친 경우
	- 부모가 종료하는 경우
	- 부모 프로세스가 종료하기 전에 자식들이 먼저 종료됨
 
---

 
<br>
### 7) 프로세스와 관련한 시스템콜
- fork : create a child (copy)
- exec : overlay new image
- wait : sleep until child is done
- exit : frees all the resources, notify parent
 
---
 
 
<br>
### 9) 프로세스 간 협력

<br>
#### a. 독립적 프로세스
- 프로세스는 각자의 주소 공간을 가지고 수행되므로
- 원칙적으로 하나의 프로세스는 다른 프로세스의 수행에 영향을 미치지 못함

<br>
#### b. 협력 프로세스
- 프로세스 협력 메커니즘을 통해 하나의 프로세스가 다른 프로세스의 수행에 영향을 미칠 수 있음
		
---

 
<br>
### 10) 프로세스 간 협력 메커니즘 (IPC: Interprocess Communication)

<br>
#### a. 프로세스간 정보를 주고받을 수 있는 방법

<br>
- Message passing: 커널을 통해 메시지 전달
	- Direct Communication: 통신하려는 프로세스의 이름을 명시적으로 표시
	- Indirect Communication: mailbox(또는 port)를 통해 메시지를 간접 전달
	- Direct, Indirect → 커널 통해 전달하는건 똑같음!
	- Indirect → 누가 꺼내볼지는 명시 안함

<br>
- Shared memory: 서로 다른 프로세스 간에도 일부 주소 공간을 공유하게 하는 shared memory 메커니즘이 있음
	- 커널한테 shared memory를 쓴다는 시스템 콜을 해서 mapping 해놓고
	- share하게 해놓은 다음에
	- 그 때부터 사용자 프로세스끼리 공유
			
---

 
<br>
### 11) 추가 내용
- A가 Shared Memory에 어떤 내용을 적으면
- B는 자신의 주소 공간에도 포함되어 있기 때문에, 그 내용을 바로 전달받아서 볼 수 있음



---

 