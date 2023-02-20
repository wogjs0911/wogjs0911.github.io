---
key: /2023/02/19/Operating-System2.html
title: CS - 운영체제(2)
tags: OS
---


# 1.  CPU Scheduling 들어가기 전

### 1) CPU burst, IO burst(앞 강의 내용)
 
#### a. CPU burst, IO burst 개념 
 
- Process를 실행하면, CPU 가 사용되는 부분이 있고, IO 가 사용되는 부분이 있음.
- CPU를 사용하는 단계를 CPU burst, IO 를 사용하는 단계를 IO burst 라고 함.
- process 가 실행된다는 것은, CPU burst 와 IO burst 를 반복하며 실행한다는 것.

<br>
#### b. 표에서 CPU burst, IO burst 
- 위의 표에서 x 축은 CPU burst 실행 시간, y 축은 빈도

- 컴퓨터 내에서 돌아가는 process 들을 살펴봤더니,

- CPU burst 가 짧고 IO burst 가 자주 끼어드는 process 들도 있고, CPU burst 가 긴 process 도 있음.

 
<br>
- CPU 를 짧게 쓰고 IO 를 주로 쓰는 작업을 IO bound job,

- CPU 를 오랫동안 쓰는 작업을 CPU bound job 이라고 함.

 

- "IO/CPU 를 주로 사용하는 process job 의 종류가 위와 같이 섞여 있다" 정도로만 이해하고 넘어가면 될 듯.

 
<br>
#### c. CPU burst, IO burst의 결론 :
- 사람과 상호작용하는 job (interactive job) 이 IO bound job 인 경우가 많음.

- 왜냐면 모니터에 출력도 해야하고 사용자로부터 입력도 받아야 하니까. 때문에 사용자 입장에서 오랫동안 기다리지 않게 하기 위해

- CPU 를 IO bound job 에게 자주 주는 것이 좋다는 교수님의 말.

- 따라서 IO bound job 에 CPU 를 자주 주도록 CPU 스케줄링이 필요하다는 것이 결론.

 
--- 


<br>
### 2) CPU Scheduler 개념
 
<br>
#### a. CPU Scheduler 
- 어떤 process 에게 CPU 를 줄 지 선택하는 녀석!!

- ready 상태인 process 중에 한 녀석을 골라 CPU 를 줄꺼야.

- CPU scheduler 는 os 내부의 CPU 를 스케줄링하는 커널 코드이다.

 
<br>
#### b. Dispatcher 
- CPU Scheduler 가 CPU 를 줄 process 를 선택하면, 해당 process 에게 CPU 제어권을 실제로 넘겨주는 녀석

- Dispatccher 가 CPU 제어권을 넘기는 이 작업을 context switching 이라고 함.

- Dispatcher 역시 CPU Scheduler 처럼 os 내부의 kernel code를 말 함.

 
--- 


<br>
### 3)  CPU 스케줄링이 필요한 경우 예시 및 정리 
- CPU 스케줄링이 필요한 경우(CPU 를 잡는 프로세스가 바뀌는 경우)를 몇 가지 예시로 들어봄.

 
<br>
#### a. Process 가 IO 요청하는 경우.

- process 가 IO 를 요청했기 때문에 CPU 를 사용하지 못하는 상황(시간이 오래 걸리기 때문이다. )

 
<br>
#### b. Timer interrupt 가 걸린 경우.

- CPU 신나게 쓰고 있다가 시간이 다 되어서 CPU 를 돌려줘야 하는 상황

 

<br>
#### c. 요청했던 IO 응답이 와서 CPU 를 사용해야 하는 상황

- 배우기로는 IO 응답이 와도 곧바로 CPU 를 사용하는게 아니라 ready 상태가 된다고 배웠는데, CPU 를 곧바로 사용하여 running 상태가 되는 경우도 있음.

- 바로, IO 응답받은 process 의 우선순위가 기존에 CPU 를 잡고 있던 process 보다 높을 때.

- 우선순위가 높은 process(IO 응답받은 녀석) 에게 CPU 를 양호하는 상황이 벌어짐.

- 즉, 우선순위가 높은 process 에게 CPU 를 빼앗기는 경우**

 

<br>
#### d.  process 가 일을 다 마치고 terminated 되는 경우, 더 이상 CPU 를 사용하지 않지.

 
<br>
#### e. 정리 : 용어가 매우 중요하다!

- 위의 a, b 예시인 경우는 "자신이 자발적으로 CPU 를 반납하는 상황", nonpreemptive(강제로 빼앗지 않는 용어)라고 하고,

- c, d 예시인 경우는 "CPU 를 반납하고 싶지 않지만 강제로 빼앗기는 상황", preemptive(강제로 빼앗는 용어) 라고 함.

  
---

<br><br>
# 2.  CPU Scheduling 시작(본 강의 내용)

### 1) CPU and I/O Bursts in Program Execution

---
 
<br>
### 2) CPU-burst Time의 분포

- 여러 종류의 job(process)들이 섞여있기 때문에 CPU 스케줄링이 필요하다.
	- Interactive job에게 적절한 response 제공 요망
	- CPU와 I/O 장치 등 시스템 자원을 골고루 효율적으로 사용

---
 
<br>
### 3) 프로세스의 특성 분류

<br>
- I/O- bound process
	- CPU를 잡고 계산하는 시간보다 I/O에 많은 시간이 필요한 job
	- Many short CPU bursts
	
<br>
- CPU-bound process
	- 계산 위주의 job
	- Few very long CPU bursts

---
 
<br>
### 4) CPU Scheduler & Dispatcher
 
- 운영체제의 특정 기능임

<br>
- CPU Scheduler
	- Ready 상태의 프로세스 중에서 이번에 CPU를 줄 프로세스를 고른다
<br>
- Dispatcher
	- CPU의 제어권을 CPU scheduler에 의해 선택된 프로세스에게 넘긴다
	- 이 과정을 context switch(문맥 교환)라고 한다.
<br>
- CPU 스케줄링이 필요한 경우는 프로세스에게 다음과 같은 상태변화가 있는 경우이다.
	- Running → Blocked(e.g. I/O 요청하는 시스템 콜)
	- Running → Ready(e.g. 할당시간 만료로 timer interrupt)
	- Blocked → Ready(e.g. I/O 완료 후 인터럽트)
	- Terminate
<br> 
- 정리 :
	- 예시일뿐 더 많은 케이스가 있을 수도
	- 1번과 4번의 경우는 nonpreemptive(= 강제로 빼앗지 않고 자진 반납) / 비선점형
	- 나머지 모든 스케줄링은 preemptive(= 강제로 빼앗음) / 선점형

---
 
<br>
### 5) Scheduling Criteria

- Performance Index ( = Performance Measure, 성능 척도)
- 위의 2가지는 CPU입장, 밑의 3가지는 프로세스 입장
- 프로세스 전체의 시작과 종료 기준이 아니라 프로세스가 CPU를 잡는 시간 기준(버스트 기준) 이라는 것에 유의

<br>
- CPU utilization 이용률
	- keep the CPU as busy as possible

<br>
- Throughput 처리량
	- number of prcesses that complete their excution per time unit

<br>
- Turnaround time 소요시간, 반환시간
	- amount of time to excute a particular process

<br>	
- Waiting time 대기시간
	- amount of time a process has been waiting in the ready queue
	
<br>	
- Response time 응답시간
	- amount of time it takes from when a request was submitted until the first response is produced, not output(for time-sharing environment)
 
---
 
<br>
### 6) Scheduling Algoritm
 

- FCFS
- SJF
- SRTF
- Priority Scheduling
- RR
- Multilevel Queue
- Mutilevel Feedback Queue

---
 
<br> 
### 7) FCFS(First-Come First-Served)
 

- 비선점형(unpreemptive)


---
 
<br>
### 8) SJF(Shortes-Job-First)
 

- 각 프로세스의 다음번 CPU burst time을 가지고 스케쥴링에 적용
- CPU burst time이 가장 짧은 프로세스를 제일 먼저 스케쥴

<br>
- 두가지 스키마(Scheme)

<br>
- Nonpreemptive
	- 일단 CPU를 잡으면 이번 CPU burst가 완료될 때까지 CPU를 선점(premmption)당하지 않음

<br>
- Preemptive
	- 현재 수행중인 프로세스의 남은 burst time보다 더 짧은 CPU burst time을 가지는 새로운 프로세스가 도착하면 CPU를 빼앗김
	- 이 방법을 Shortest-Remaining-Time-First(SRTF)라고도 부른다.

<br>
- SJF is optimal
	- 주어진 프로세스들에 대해 minimun average waiting time을 보장 → 모든 알고리즘 중에서 가장 짧은 waiting time을 보장한다.

<br>
- 단점
	- starvation → Long process가 영원히 실행되지 않을수도 있다.
	- 프로그램의 정확한 사용시간을 미리 알수가 없으므로 추정을 해야함.
 
---
 
<br>
### 9) Priority Scheduling
 
<br>
- A priority number(integer) is associated with each process
- highest priority를 가진 프로세스에게 CPU 할당
	- Preemptive
	- nonpreemptive

<br>
- (smallest integer - highest priority)
- SJF는 일종의 priority scheduling이다.
- priority = predicated next CPU burst time

<br>
- 문제점
	- Starvation(기아 현상): low priority processes may nver execute

<br>
- 해결방법
	- Aging: as time progresses increase the priority of the process

---
 
<br>
### 10) RR(Round Robin) - 현대의 운영체제가 사용하는 방법
 

- 각 프로세스는 동일한 크기의 할당시간(time quantum)을 가짐
- (일반적으로 10-100 milliseconds)
- 할당 시간이 지나면 프로세스는 선점(preemted)당하고 ready queue의 제일 뒤에가서 다시 줄을 선다.

<br>
- n개의 프로세스가 ready queue에 있고 할당 시간이 q time unit인 경우 각 프로세스는 최대 q time unit단위로 CPU 시간의 1/n을 얻는다.
→ 어떤 프로세스도 (n-1)q time unit 이상 기다리지 않는다.

<br>
- 장점: 응답시간이 빨라진다.(최초로 CPU를 얻게되는 시간)
- 단점: 특정조건에서는 오히려 비효율적임(모든 프로세스의 실행시간이 동일한경우??)
- 턴어라운드, 웨이팅타임이 악화될 수도 있음.

<br>
- Performance
- q large → FCFS
- q small → context switch 가 빈번해져 overhead의 부담


 
---
 
<br>
### 11) Multilevel Queue
 
<br>
- Ready Queue를 여러개로 분할
- foreground(interactive)
- background(batch - no human interaction)

<br>
- 각 큐는 독립적인 스케쥴링 알고리즘을 가짐
- foreground - RR
- background - FSFS

<br>
- 개별 큐에 대해서도 스케쥴링이 필요
	- Fixed priority scheduling(우선순위로 고정)
		- serve all from foreground then from background
		- Possibility of starvation

<br>
- Time slice(시간단위로 분배)
	- 각 큐에 CPU time을 적절한 비율로 할당
	- e.g. 80% to foreground in RR, 20% to background in FCFS

---
 
<br>
### 12) Multilevel Feedback Queue
 
- 프로세스가 다른 큐로 이동 가능
- 에이징(aging)을 이와 같은 방식으로 구현할 수 있다(오래되면 프로세스를 다른 큐로 이동 시켜서)

<br>
- Multilevel-feedback-queue를 정의하는 파라미터들
	- Queue의 수
	- 각 Queue의 Scheduling algorithm
	- Process를 상위 큐로 보내는 기준
	- Process를 하위 큐로 내쫓는 기준
	- 프로세스가 CPU 서비스를 받으려 할 때 들어갈 큐를 결정하는 기준


---
 
<br>
### 13) Multiple-Processor Scheduling
 

- CPU가 여러개인 경우 스케쥴링은 더욱 복잡해짐

<br>
- Homogeneous processor인 경우
	- Queue에 한줄로 세워서 각 프로세서가 알아서 꺼내가게 할 수 있다.
	- 반드시 특정 프로세서에서 수행되어야 하는 프로세스가 있는 경우에는 문제가 더 복잡해짐

<br>
- Load Sharing
	- 일부 프로세서에 job이 몰리지 않도록 부하를 적절히 공유하는 메커니즘 필요
	- 별개의 큐를 두는 방법 vs 공동 큐를 사용하는 방법

<br>
- Symmetric Multiprocessing(SMP)
	- 각 프로세서가 각자 알아서 스케쥴링 결정

<br>
- Asymmetric Multiprocessing
	- 하나의 프로세서가 시스템 데이터의 접근과 공유를 책임지고 나머지 프로세서는 거기에 따름

---
 
<br>
### 14) Real-Time Scheduling
 
- periodic한 성격의 작업이 많다.

<br>
- Hard real-time systems
	- Hard real-time task는 정해진 시간 안에 반드시 끝내도록 스케줄링해야 함 → 데드라인내 실행이 보장되어야함

<br>
- Soft real-time computing
	- Soft real-time task는 일반 프로세스에 비해 높은 priority를 갖도록 해야함

---
 
<br>
### 15) Thread Scheduling

<br>
- Local Scheduling
	- User level thread의 경우 사용자 수준의 thread library에 의해 어떤 thread를 스케쥴 할지 결정

<br>
- Global Scheduling
	- Kernel level thread의 경우 일반 프로세스와 마찬가지로 커널의 단기 스케줄러가 어떤 thread를 스케줄 할지 결정

---
 
<br>
### 16) Algorithm Evaluation
 
<br>
#### a. Queueing models

- 확률 분포로 주어지는 arrival rate와 service rate 등을 통해 각종 performance index 값을 계산

<br>
#### b. Implementation(구현) & Mesurement(성능 측정)

- 실제 시스템에 알고리즘을 구현하여 실제 작업(workload)에 대해서 성능을 측정 비교
→ 운영체제 코드를 실제로 고쳐보는 것(어려움)

<br>
#### c. Simulation(모의 실험)

- 알고리즘을 모의 프로그램으로 작성 후 trace(시뮬레이션 프로그램의 인풋으로 들어갈 테스트케이스?)를 입력으로 하여 결과 비교
 
---
 
<br>
### 17) 다음 CPU Burst Time의 예측
 
<br>
- 다음번 CPU burst time을 어떻게 알 수 있는가?
	- (Input data, branch, user)

<br>
- 추정(estimate)만이 가능하다
- 과거의 CPU burst time을 이용해서 추정 (exponential averaging)
 


 

