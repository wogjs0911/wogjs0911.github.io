---
key: /2023/02/19/Operating-System2.html
title: CS - 운영체제(2)
tags: OS CpuScheduling ProcessSyschronization Deadlock
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
	- User level thread의 경우 사용자 수준의 thread library에 의해 어떤 thread를 스케쥴 할지 결정(유저용)

<br>
- Global Scheduling
	- Kernel level thread의 경우 일반 프로세스와 마찬가지로 커널의 단기 스케줄러가 어떤 thread를 스케줄 할지 결정(커널용)

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

- 알고리즘을 모의 프로그램으로 작성 후 trace(시뮬레이션 프로그램의 입력값으로 들어갈 테스트케이스?)를 입력으로 하여 결과 비교
 
---
 
<br>
### 17) 다음 CPU Burst Time의 예측
 
<br>
- 다음번 CPU burst time을 어떻게 알 수 있는가?
	- (Input data, branch, user)

<br>
- 추정(estimate)만이 가능하다
- 과거의 CPU burst time을 이용해서 추정 (exponential averaging)
 
---

<br><br>
### 18) 최종 정리


- CPU 가 하나인 상황에서의 스케줄링 기법


<br>
#### a. FCFS : First Come, First Served

 

- 먼저 온 순서대로 먼저 처리함. 무슨 process 인지, 우선순위가 어떤지도 따지지 않고 그냥 먼저 오는 순으로 처리. 이것은 nonpreemptive 스케줄링임. 즉, CPU 를 갖게 되면 자발적으로 내려놓지 않는 이상 CPU 를 빼앗기지 않음. 이것은 비효율적임. CPU 를 길게 쓰는 IO Bound 가 먼저 와서 CPU 점유해버리면 나중에 온 CPU Bound 잡들이 계속 기다리게 되기 때문에 비효율적임. 이렇게 긴 job 때문에 짧은 job 들이 큐에서 기다리는 현상을 Convoy Effect 라고 함.

--- 

<br>
#### b. SJF : Shortest Job First 

 
- 실행 시간이 짧은 Job 부터 처리함. 스케줄링 기법 중 Job들의 평균 대기 시간(Average Waiting Time) 이 가장 짧음. 근데 긴 Job 이 영원히 기다릴 수 있음(이것을 starvation 현상이라고 함)

- preemptive 버전과 nonpreemptive 버전이 있음.

- preemptive 버전은, 짧은 job이 CPU 점유하고 있는 와중에 더 짧은 job이 오면 CPU 를 빼앗김.

- nonpreemptive 버전은 빼앗기지 않고 다 끝낸 다음에 가장 짧은 job이 CPU 를 얻음.

---

<br>
#### c. Priority 


- 우선순위가 제일 높은 Process 먼저 CPU 를 줌. 이 역시 preemptive 버전과 nonpreemptive 버전이 있음. 

- 또한, starvation 현상 역시 발생 가능. starvation 을 방지하기 위해, Aging 이라는 기법을 사용.

- 우선 순위가 낮은 Process 가 순서를 빼앗기면서 오래오래 기다리게 되면, 오래 기다린 만큼 우선 순위가 올라가서 CPU 를 점유할 수 있도록 기법.

---
 
<br>
#### d.  Round Robin 
 

- 위의 스케줄링에서는 preemptive 가 아닌 이상에야 job 이 끝날 때 까지 CPU 를 선점하지만, RR 은 CPU 를 줄 때 정해진 시간 만큼만 줘서 job 이 끝나지 않았음에도 CPU 를 강제로 빼앗음(preemptive) 

- process 들이 CPU 를 최초로 얻기까지 걸리는 시간인 '응답시간 response time' 이 빨라짐. 왜냐면 CPU 를 조금씩 줬다 빼앗었다 하기 때문에. CPU 를 나눠주는 기준은? 모든 Process 에게 균등하게 기회를 한 번씩 주나봄. 그러면, FCFS 의 time preemptive 버전이라고 볼 수 있을까? 그렇다.

- RR 의 특징 중 하나는, CPU 를 길게 쓰는 process 는 기다리는 시간이 길고 (CPU 기다리는 횟수가 많음) CPU 를 짧게 쓰는 process 는 기다리는 시간이 짧음 (CPU 기다리는 횟수 적음)

- 왜냐면 짧은 process 들은 n만큼 기다렸다가 CPU 할당받고 금방 쓰고 나가는데 긴 process 들은 n만큼 기다렸다가 CPU 할당받고 쓰고 빼앗기는 일을 여러번 반복해야 하기 때문에.


- CPU 를 점유하는 시간을 q 라고 하자. q를 길게 하면 할수록 FCFS 와 똑같아지고(Convoy Effect) q를 짧게 하면 CPU 점유하는 process 간 context switching 이 계속 일어나기 때문에 시스템 전체 성능이 떨어짐. 결국, 적당한 q 가 좋음 ( 대략 10~100 ms 라고 함 )

- SJF 보다 average turnaround time 이 길지만 response time (최초로 CPU 를 받는 데 걸리는 시간) 은 짧다. 응답 시간이 짧다는 것이 중요한 장점!

 
- 실행 시간이 모두 100s 로 똑같은 job 이 5개가 있다고 하자. RR 의 q가 1초라면, 5개의 job 들은 1초씩 번갈아가며 CPU 를 할당받다가, 500초가 될 때 5개의 job 들이 차례대로 끝이 나게 된다. 

- 이 말은, 500초 동안 어떤 job들도 끝나지 않는다는 말. 차라리 q를 100으로 두어서, 100초에 job 하나 끝내고, 200초에 job 하나 끝내고... 하는 편이 먼젓번의 예보다는 나음. 일반적으로는 긴 process 와 짧은 process 가 섞여있기 때문에 위의 일이 많이 일어나지 않음  이런 특수한 상황도 있다는 걸 알아두자.

 

 
---
 
<br>
#### e. Multilevel Queue


- Multilevel Queue 는 우선순위가 각기 다른 레디큐를 여러개 두는 것임. 위에 이미지에서 보는 것 처럼, 가장 위에 system 이 1순위, 그 다음 interactive 가 2순위, ,,, 마지막 student 가 5순위임. 이렇게 계급별로 나눠진 큐에 각 process 들이 들어가서 기다림. CPU 는 하나뿐이기 때문에, 1순위 큐에 있는 process 들이 먼저 CPU 를 사용함. 1순위 큐가 비면 2순위 큐의 process 들이 CPU 를 사용하고.... 이렇게 큐의 계급을 따라서 CPU 를 사용하게 됨.

 

- 여기서 우선순위의 기준은 무엇인가? 또한, 하나의 큐에서 CPU 를 사용하는 기준은 또 무엇인가? 전자와 후자의 기준은 상황에 따라 다를 수 있음. process 들은 전자의 기준에 따라 들어가는 큐가 달라지게 될 것임. 여기서 말하는 상황이라는 것을 아래 예를 들어 이해해보자.


- 두 개의 큐 (foreground, background) 가 있다고 하자. 이 두 개의 큐의 우선순위는 foreground 가 높다. forground 큐에서 process 를 선출할 때는 RR 방식을 이용(왜냐면 interactive 한 process 이기 때문에 응답 시간이 빨라야 하므로) background 큐에서 process 를 선출할 때는 FCFS 방식을 이용(왜냐면 batch job 이라서 응답시간이 빠를 필요없이 천천히 진행해도 괜찮기 때문)


- 근데 forg 에 process 가 계속 쌓이면 우선순위가 낮은 backg 내의 process 들이 영원히 처리되지 않는 startvation 현상이 빚어질 수 있기 때문에, time slice 를 둠. 8:2 로 두어서, 적어도 단위 시간의 20%는 backg 가 쓸 수 있도록 함.

---


<br><br>
- CPU 가 여러개일 때의 스케줄링 기법

<br>
#### a. Real-Time Scheduling 

 
- Hard Real-Time system : 반드시 정해진 시간 내에 task 를 끝내도록 스케줄링해야 함. 정해진 task 처리 시간을 넘기면 실패하는 경우 (자동차의 air-bag 등)


- Soft Real-Time system : 일반 프로세스에 비해 높은 priority 를 갖고 task 를 실행함. 정해진 task 처리 시간을 넘기면 성능이 감소하는 경우 (streaming video 등)

- (그래서 최대한 빨리 끝낼 수 있도록. dead line 이 있긴 하지만 조금 넘어도 상관 없음)

- 이벤트가 발생하고 나서부터 응답 할 때까지의 시간을 Event Latency 라고 함

 
 
<br>
#### b. Thread Scheduling

 
- User level thread : process 내부에서만 thread 의 존재를 알고 있음. 커널은 몰라. 사용자 process 가 직접 thread 를 관리.

- Kernel level thread : 커널이 process 내부의 thread 존재를 알고 있음.

 
<br>
- Local Scheduling : 사용자 Process 가 CPU 를 잡고 있을 때, Process 가 직접 어떤 thread 에게 CPU 를 나눠줄지 스케줄링하는 것. 커널은 이 Process 에게 CPU 만 줄 뿐 thread 관리 측면에서는 전혀 손대지 않음.

- Global Scheduling : 커널이 thread 의 존재를 알고 있고 직접 thread 를 관리하고 CPU 스케줄링함. 커널이 특정 스케줄링에 의해 Process 에게 CPU 주듯이 thread 에게도 특정 스케줄링에 의해 CPU 를 나눠줌.


---

<br><br>
# 3. Process Syschronization

- 데이터의 접근

---

<br> 
### 1) Race Condition

- a. 공유 메모리를 사용하는 프로세스들
- b. 커널 내부 데이터를 접근하는 루틴들 간(시스템콜)
 
---

<br> 
#### a. OS에서 언제 Race Condition이 발생하는가?
 
- a. Kernel 수행 중 인터럽트 발생 시, inturrupt를 disable시켜서 해결. 순차적으로 하도록!

- b. Process가 System call을 하여 Kernel mode로 수행중인데 context switch가 일어나는 경우

- c. Multiprocessor에서 shared memory 내의 kernel data


 
---

<br> 
#### b. Process Synchronization 문제
 

- 공유데이터 shared data의 동시 접근 concurrent access는 데이터의 불일치 문제 inconsistency를 발생시킬 수 있다.
일관성 consistency 유지를 위해서는 협력 프로세스 cooperating process 간의 실행 순서 orderly execution를 정해주는 매커니즘 필요
 
---

<br> 
#### c. Race Condition
 

- 여러 프로세스들이 동시에 공유 데이터를 접근하는 상황
- 데이터의 최종 연산 결과는 마지막에 그 데이터를 다룬 프로세스에 따라 달라짐
- Race condition을 막기 위해서는 concurrent process는 동기화 Sycnhronize되어야 한다

- Example of a Race Condition
- 보통은 문제가 안생기지만, 공유데이터에 접근하는 등의 위의 예에서는 문제가 될 수도 있다.
 
---

<br> 
### 2) The Critical-Section Problem

- Critical-Section = 임계구역

 

- n개의 프로세스가 공유 데이터를 동시에 사용하기를 원하는 경우 각 프로세스의 code segment에는 공유데이터를 접근하는 코드인 critical section이 존재
- Problem
	- 하나의 프로세스가 critical section에 있을 때 다른 모든 프로세스는 critical section에 들어갈 수 없어야 한다

→ 이 문제를 어떻게 해결할까? 를 고민하는 챕터

 
---

<br> 
#### a. Initial Attempts to Solve Probelm
 

- 두개의 프로세스가 있다고 가정
- 프로세스들의 일반적인 구조

```cpp
do {
	entry section
	ciritical section
	exit section
	remainder section
} while (1);

```

- 프로세스들은 수행의 동기화(synchronize)를 위해 몇몇 변수를 공유할 수 있다 → synchronization variable
 
---

<br> 
#### b. 프로그램적 해결법의 충족조건
 
<br>
- Mutual Exclusion(상호 배제)
	- 프로세스 Pi가 critical section 부분을 수행 중이면 다른 모든 프로세스들은 그들의 critical section에 들어가면 안된다.

<br>
- Progress
	- 아무도 critical section에 있지 않은 상태에서 critical section에 들어가고자 하는 프로세스가 있으면 critical section에 들어가게 해주어야 한다.

<br>
- Bounded Waiting(유한대기)
	- 프로세스가 critical section에 들어가려고 요청한 후부터 그 요청이 허용될 때까지 다른 프로세스들이 critical section에 들어가는 횟수에 한계가 있어야 한다.

<br>
- 가정: 
	- 1) 모든 프로세스의 수행속도는 0보다 크다
	- 2) 프로세스들 간의 상대적인 수행속도는 가정하지 않는다
	
<br>
* 코드로 작성된 문장의 고급언어이기 때문에 단일 instruction이 아니라서 CPU를 빼앗길 수 있는 상황을 가정

 

---

<br> 
### 3) Algorithm 모음

<br> 
#### a. Algorithm 1

- 문제점: Progress를 충족 못함
- 설명 :
 
---

<br> 
#### b. Algoritm 2
 
- 설명 :
 
---

<br> 
#### c. Algoritm 3 (Peterson’s Algoritm)

- 설명 :

- 턴과 플래그를 모두 사용
- 상대방이 깃발과 턴을 모두 가지고있지 않을때만 대기하고 있음
- 문제점: Busy Waiting(=spin lock) / 계속 CPU와 메모리 자원을 쓰면서 기다린다.
 
---

<br> 
### 4) Synchronization Hardware
 

- 하드웨어적으로 Test & Modify를 atomic(intruction 단위로 끊어)하게 수행할 수 있도록 지원하는 경우 앞의 문제는 간단히 해결된다.

 
---

<br> 
#### a. Semaphores
 
<br>
- 앞의 방식들을 추상화시킴
	- 추상자료형(object, operation) → 더 알아보기

<br>
- Semaphore S
	- integer variable
	- 아래의 두가지 automic 연산에 의해서만 접근 가능

<br>
##### a) Busy Wait

Critical Section of n Processes By Semaphore - Spin Lock
 

단점: Spin Lock
Block & Wakeup 방식의 구현도 가능 (=sleep lock)

<br> 
##### b) Block & Await
 
- Critical Section of n Processes By Semaphore - Block & WakeUp
- 구체적인 구현(block/wakeup)
- P: 자원반출 / V: 자원반납

<br> 
##### c) 어떤 방식이 더 나을까? (busy wait vs block wakeup)
 
<br>
- Block/wakeup overhead versus Critical Section의 길이
	- Critical section의 길이가 긴 경우 Block Wakeup이 적당
	- Critical section의 길이가 매우 짧은 경우 Block/Wakeup 오버헤드가 Busy-wait오버헤드보다 더 커질 수 있음
	- 일반적으로는 Block/WakeUP 방식이 더 좋음
 
<br>
##### d) 두가지 타입의 세마포어
 
<br>
- Counting semaphore
	- 도메인이 0 이상인 임의의 정수값
	- 주로 resource counting에 사용
<br>
- Binary semaphore(=mutex)
	- 0 또는 1 값만 가질 수 있는 semaphore
	- 주로 mutual exclusion (lock/unlock)에 사용
 
---

<br> 
### 5) Deadlock and Starvation의 문제
 
<br>
- Deadlock: 둘 이상의 프로세스가 서로 상대방에 의해 충족될 수 있는 event를 무한정 기다리는 현상
- S와 Q가 1로 초기화된 semaphore라 했을때,

<br>
- Starvation
	- Indefinite blocking: 프로세스가 suspend된 이유에 해당하는 세마포어 큐에서 빠져나갈 수 없는 현상
	- 식사하는 철학자 문제(데드락 문제도 발생할수 있음! 생각해보자)
	- Dining-Philosophers Problem
	- 해결방법 : 자원의 획득 순서를 정의해주면 된다.(프로그래머가 유의해서 작성해야 할 문제임)
 
---

<br> 
#### a. Bounded-Buffer Problem(생산자-소비자 문제)
 
<br>
- 버퍼의 크기가 유한한 환경에서
- 생산자 프로세스, 소비자 프로세스가 각각 여러개 있는 상황
- 버퍼가 가득 찼을때는 생산자도 버퍼에 데이터를 쓰지 못함
- 세마포어의 역할이 2가지
	- 동시 접근을 방해하기 위해(전체버퍼에 대한 접근을 막는건가?)
	- 가용자원을 표시하기 위해(생산자: 비어있는 버퍼, 소비자: 내용이 있는 버퍼)

<br>
- Synchronization Variables
	- semaphore full = 0, empty = n, mutex = 1

```cpp
//Producer
do { 
	...
	produce an item in x
	...
	P(empty);
	P(mutex):
	...
	add x to buffer
	V(mutex);
	V(full);
} while (1);
 
//Consumer
 
do { 
	P(full);
	P(mutex):
	...
	remove an item from buffer to y
	...
	V(mutex);
	V(empty);
	...
	consume the item in y
	...
} while (1);
``` 
 
---

<br> 
#### b. Readers-Writers Problem
 
<br>
- 한 프로세스가 DB에 write 중일 때, 다른 프로세스가 접근하면 안됨
- read는 동시에 여럿이 해도 됨

<br>
- 해결책
	- Writer가 DB에 접근 허가를 아직 얻지 못한 상태에서는 모든 대기중인 Reader들을 다 DB에 접근하게 해준다.
	W- riter는 대기 중인 Reader가 하나도 없을 때 DB접근이 허용된다
	- 일단 Writer가 DB에 접근 중이면 Reader들은 접근이 금지된다
	- Writer가 DB에서 빠져나가야만 Reader의 접근이 허용된다
	
<br>
- Shared data
	- DB 자체
	- readcount; (현재 DB에 접근 중인 Reader의 수)

<br>
- Synchronization variables
	- mutex: 공유변수 readcount를 접근하는 코드(critical section)의 mutual exclusion 보장을 위해
	- db: Reader와 Writer가 공유 DB자체를 올바르게 접근하는 역할


```cpp
/*
Shared data 
- int readcount = 0;
- DB 자체
Synchronization variables
- semaphore mutex = 1, db = 1
*/
 
//Writer
P(db);
...
writing DB is performed
...
V(db);
// Starvation 발생 가능
 
//Reader
P(mutex); // 공유변수 lock
readcount++;
if (readcount == 1) P(db); /* block writer */
V(mutex);
    ...
reading DB is performed
    ...
P(mutex);
readcount--;
if (readcount == 0) V(db); /* enable writer */
V(mutex):

```

<br>
- Starvation을 어떻게 해결해야 하나?
	- Writer의 차례를 한번씩 주는걸로 해결할 수 있다.
 
---

<br> 
#### c. Dining-Philosophers Problem
 

- Synchronization Variables
- semaphore chopstick[5] (모든 처음 값은 1]
- Philosopher i



```cpp
do {
	P(chopstick[i]);
	P(chopstock[(i+1) % 5]);
	...
	eat();
	...
	V(chopstick[i]);
	V(chopstick[(i+1) % 5]);
	...
	think();
	...
} while (1);
```

<br>
- 위 코드의 문제점 : 
	- Deadlock 가능성이 있다.
	- 모든 철학자가 동시에 배가 고파져 왼쪽 젓가락을 집어버린 경우

---

<br>
- 해결방안 : 
	- 4명의 철학자만이 테이블에 동시에 앉을 수 있도록 한다
	- 젓가락을 두개 모두 집을 수 있을 때에만 젓가락을 잡을 수 있게
	- 비대칭 : 짝수 철학자는 왼쪽 젓가락부터 잡도록, 홀수는 오른쪽 부터

```cpp

enum { thinking, hungry, eating } state[5];
semaphore self[5]=0 ;
semaphore mutex=1;
 
Philosopher i
do { 
  pickup(i);
  eat();
  putdown(i);
  think();
} while(1);
 
void putdown(int i) {
  P(mutex);
  state[i] = thinking;
  test((i+4) % 5);
  test((i+1) % 5);
  V(mutext);
}
 
void pcickup(int i) {

```



---


<br><br>
# 4. DeadLock

<br>

## 1) The Deadlock Problem
 
<br>

#### a. DeadLock
- 일련의 프로세스들이 서로가 가진 자원을 기다리며 block된 상태

<br>

#### b.Resource(자원)
- 하드웨어, 소프트웨어 등을 포함하는 개념
- ex) I/O Device, CPU cycle, memory space, semaphore 등
- 프로세스가 자원을 사용하는 절차(요청, 할당, 사용, 반납)
	- Request, Allocate, Use, Release

<br>

#### c. 데드락 예시
- 시스템에 2개의 테이프 드라이버가 있는데, 프로세스 P1과 P2가 각각 하나의 테이프 드라이버를 보유한 채 다른 하나를 기다리고 있을 때
- Binary semaphores A and B

---


<br><br> 

## 2) Deadlock 발생의 4가지 조건
 
<br>
- Mutual exclusion(상호 배제)
	- 매 순간 하나의 프로세스 만이 자원을 사용할 수 있음

<br>
- No preemption (비선점)
	- 프로세스는 자원을 스스로 내어놓을 뿐 강제로 빼앗기지 않음

<br>
- Hold and wait(보유 대기)
	- 자원을 가진 프로세스가 다른 자원을 기다릴 때 보유 자원을 놓지 않고 계속 가지고 있음

<br>
- Cicular wait(순환 대기)
	- 자원을 기다리는 프로세스 간에 사이클이 형성

 
---


<br><br> 

## 3) Resource-Allocation Graph(자원할당 그래프)
 



- 좌측은 데드락, 우측은 데드락 아님.
- 그래프에 cycle이 없으면 deadlock이 아니다.
- 그래프에 cycle이 있으면
	- if only one instance per resource type, then deadlock(그림에서 점의 개수가 instance의 수)
	- if several instances per resource type, possibility of deadlock
 
---


<br><br> 

## 3) Deadlock의 처리 방법
 
<br>
- Deadlock Prevention(미리막음)	
	- 자원 할당 시 Deadlock의 4가지 필요 조건 중 어느 하나가 만족되지 않도록 하는 것

<br>
- Deadlock Avoidance(미리피함)
	- 자원 요청에 대한 부가적인 정보를 이용해서 deadlock의 가능성이 없는 경우에만 자원을 할당
	- 시스템 state가 원래 state로 돌아올 수 있는 경우에만 자원 할당

<br>
- Deadlock Detection and recovery(생기게 놔두고, 발생했을 때 처리)
	- Deadlock 발생은 허용하되 그에 대한 detection 루틴을 두어 deadlock 발견 시 recover

<br>
- Deadlock Ignorance
	- Deadlock을 시스템이 책임지지 않음
	- UNIX를 포함한 대부분의 OS가 채택
 
---
 
<br><br> 

### a. Deadlock Prevention(데드락의 4가지 조건 중 하나를 원천적으로 차단하는 방법)
 
<br>
#### Mutual Exclusion
- 공유해서는 안되는 자원의 경우 반드시 성립해야 함

<br>
#### Hold and Wait
- 프로세스가 자원을 요청할 때 다른 어떤 자원도 가지고 있지 않아야 한다. (보유하고 있으면서 요청할때 데드락이 생기므로)
- 방법 1: 프로세스 시작 시 모든 필요한 자원을 할당받게 하는 방법(비효율적)
- 방법 2: 자원이 필요할 경우 보유 자원을 모두 놓고 다시 요청

<br>
#### No Preemption(빼앗는 것을 허용한다 → Preemption 허용)
- process가 어떤 자원을 기다려야 하는 경우 이미 보유한 자원이 선점됨
- 모든 필요한 자원을 얻을 수 있을 때 그 프로세스는 다시 시작된다
- State를 쉽게 save하고 restore할 수 있는 자원에서 주로 사용 (CPU나 memory같은 자원이 해당됨)

<br>
####  Circular Wait
- 모든 자원 유형에 할당 순서를 정하여 정해진 순서대로만 자원 할당
- 예를 들어 순서가 3인 자원 R을 보유 중인 프로세스가 순서 1인 자원 R1을 할당받기 위해서는 우선 R1을 Release 해야 한다.
- 결과 : Uitilization(이용률) 저하, Throughput(성능-처리량) 감소, Starvation 문제

---
 
<br><br> 

### b. Deadlock Avoidance(항상 sfae를 유지하는 보수적이고 매우 안전한 방법)
 
<br>
- 자원 요청에 대한 부가정보를 이용해서 자원할당이 deadlock으로 부터 안전한지를 동적으로 조사해서 안전한 경우에만 할당

<br>
- 가장 단순하고 일반적인 모델은 프로세스들이 필요로 하는 각 자원별 최대 사용량을 미리 선언하도록 하는 방법임

<br>
- safe state
	- 시스템 내의 프로세스들에 대한 safe sequence가 존재하는 상태

<br>
- safe sequence
	- 프로세스의 sequence < P1, P2, …, Pn >이 safe 하려면 Pi의 자원 요청이 “가용자원 + 모든 Pj의 보유 자원"에 의해 충족되어야 함
	- 조건을 만족하면 다음 방법으로 모든 프로세스의 수행을 보장
		- Pi의 자원 요청이 즉시 충족될 수 없으면 모든 Pj(j<i)가 종료될 때까지 기다린다.
		- Pi-1이 종료되면 Pi의 자원 요청을 만족시켜 수행한다.

<br>
- 시스템이 safe state에 있으면 → 데드락이 발생하지 않음
- unsafe state에 있으면 → 데드락 발생 가능성

<br>

#### Deadlock Avoidance
- 시스템이 unsafe state에 들어가지 않는 것을 보장

<br>
- 2가지 경우의 avoidance 알고리즘
	- Single instance per resource types
		- Resource Allocation Graph Algorithm
	- Multiple Instances per resource types
		- Banker’s Algorithm 사용
 

<br>

#### Resource Allocation Graph Algorithm(자원당 인스턴스가 하나일 때)

<br>
- Claim edge Pi → Rj
	- 프로세스 Pi가 자원 Rj를 미래에 요청할 수 있음을 뜻함(점선으로 표시)
	- 프로세스가 해당 자원 요청시 request edge로 바뀜(실선)
	- Rj가 release 되면 assignment edge는 다시 claim edge로 바뀐다

<br>
- request edge의 assginment edge 변경 시 (점선을 포함하여) cycle이 생기지 않는 경우에만 요청 자원을 할당한다. → 데드락의 위험성을 조사하여 발생할 가능성이 없을때만 할당

<br>
- Cycle 생성 여부 조사 시 프로세스의 수가 n일 때 O(n^2) 시간이 걸림

<br>
- 3번째 그림 → A cycle is formed(unsafe) 데드락은 아니지만, P1이 R2를 요청하면 데드락 발생할 가능성 있음
 

 
<br>
#### Bankers Algorithm(자원 당 인스턴스가 여러개일 때)

<br>
- 가정1. 모든 프로세스는 자원의 최대사용량을 미리 명시
- 가정2. 프로세스가 요청 자원을 모두 할당받은 경우 유한 시간 안에 이들 자원을 다시 반납한다

<br>
- 방법(보수적으로, 절대 deadlock이 발생하지 않는 상황을 상정한다. 밑에 그림에서 P0의 요청에 따라 준다고해서 deadlock이 무조건 발생하는 것은 아니지만, 최악의 상황을 가정한다.)
<br>
- 기본개념: 자원 요청 시 safe 상태를 유지할 경우에만 할당
	- 총 요청 자원의 수가 가용 자원의 수보다 적은 프로세스를 선택(그런 프로세스가 없으면 unsafe 상태)
	- 그런 프로세스가 있으면 그 프로세스에게 자원을 할당
	- 할당받은 프로세스가 종료되면 모든 자원을 반납
	- 모든 프로세스가 종료될 때까지 이러한 과정 반복

---
 
<br><br> 

### c. Deadlock Detection and Recovery

<br>
- Deadlock Detection
	- Resource type 당 single instance인 경우
		- 자원 할당 그래프에서의 cycle이 곧 deadlock을 의미
	- Resource type 당 multible instance인 경우
		- Banker’s algorithm과 유사한 방법 활용
 

<br>

#### a) Wait-for graph 알고리즘

- Resource type 당 single instance인 경우

<br>
- Wait-for graph
	- 자원 할당 그래프의 변형
	- 프로세스만으로 node 구성
	- Pj가 가지고 있는 자원을 Pk가 기다리는 경우 Pk → Pj

<br>
- Algorithm
	- Wait-for graph에 사이클이 존재하는지를 주기적으로 조사
	- O(n^2) - DFS/BFS

 
<br>

#### b) Multiple instane인 경우
<br>
- Bankers 알고리즘과는 다르게 낙관적으로 자원의 분배를 예상한다.
- 추가 요청 가능량이 아니라, 실제 요청 자원량으로 판단
- `아무것도 요청하지 않은` 프로세스의 자원을 반납시켜서 다른곳에 쓸 수 있다고 낙관적으로 가정해서 판단한다.

<br>
#### c) Recovery 방법

<br>
- Process termination
	- Abort all deadlocked processes(데드락에 연루된 모든 프로세스를 kill)
	- Abort one process at a time until the deadlock cycle is eliminated(하나씩 kill)

<br>
- Resource Preemption(데드락에 연루된 프로세스의 자원을 뺏는 방법)
	- 비용을 최소화 할 victim의 선정
	- safe state로 rollback하여 process를 restart
	- Starvation 문제
		- 동일한 프로세스가 계속해서 victim으로 선정되는 경우
		- cost factor에 rollback 횟수도 같이 고려


---
 
<br><br>
 
### d.  Deadlock Ignorance
 
<br>
- Deadlock이 일어나지 않는다고 생각하고 아무런 조치도 취하지 않음
	- Deadlock이 매우 드물게 발생하므로 deadlock에 대한 조치 자체가 더 큰 overhead일 수 있음
	- 만약, 시스템에 deadlock이 발생한 경우 시스템이 비정상적으로 작동하는 것을 사람이 느낀 후 직접 process를 죽이는 등의 방법으로 대처
	- UNIX, Windows 등 대부분의 범용 OS가 채택

