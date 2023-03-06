---
key: /2023/02/25/Operating-System3.html
title: CS - 운영체제(3)
tags: OS MemoryManagement VirtualMemory FileSystems FileSystemsImplementation DiskManagement DiskScheduling
---

# 1. Memory Management

### 1) Logical versus Physical Address

<br>
- Logical address( = virtual address)
	- 프로세스마다 독립적으로 가지는 주소 공간
	- 각 프로세스마다 0번지부터 시작
	- CPU가 보는 주소는 logical address임

<br>
- Physical address
	- 메모리에 실제 올라가는 위치

<br>
- 주소 바인딩: 주소를 결정하는것
	- Symbolic Address(변수이름, 함수이름) → Logical Address → Physical Address

<br>
- 그렇다면 논리 주소가 물리적인 주소로 결정되는 시점이 언제인가?

<br>
- 주소 바인딩(Address Binding) - 물리적인 메모리가 결정되는 시점
	-  현대의 OS는 논리주소가 담긴 실행파일이 통으로 메모리에 올라가지 않지만, 이 챕터에서는 그런 상황을 가정하여 설명**

---

<br>

### 2) 3가지 바인딩 유형

- 컴파일러가 논리 주소가 부여된 실행파일을 생성하는 과정은 동일

<br>
- Compile time Binding → 현대의 컴퓨터 시스템에서는 거의 사용하지 않음
	- 물리적 메모리 주소가 컴파일 시 알려짐
	- 시작 위치 변경 시 재 컴파일
	- 컴파일러 코드는 절대코드(absolute code)생성

<br>
- Load time Binding
	- 실행이 시작 되서 메모리에 올라갈 때
	- Loader의 책임하에 물리적 메모리 주소 부여
	- 컴파일러가 재배치 가능 코드(relocatalbe code)를 생성한 경우 가능

<br>
- Execution time Binding(Runtime Binding)
	- 수행이 시작된 이후에도 프로세스의 메모리 상 위치를 옮길 수 있음(실행되는 도중 주소가 변경 될 수 있음)
	- CPU가 주소를 참조할 때마다 binding을 점검(address mapping table)
	- 하드웨어적인 지원이 필요
		- ex) base and limit registers, MMU

---

<br>

### 3) MMU(Memory-Management Unit)

- Logical Address를 Physical Address로 맵핑해 주는 Hardware Device

<br>

- MMU Scheme: 사용자 프로세스가 CPU에서 수행되며 생성해내는 모든 주소값에 대해 base register(=relocation register)의 값을 더한다

- limit register: 프로세스의 논리적 주소 범위 정보 저장

- relocation register: 접근할 수 있는 물리적 메모리 주소의 최소값

- 사용자 프로그램은 Logical Address만을 다루며, 실제 Physical Address를 볼 수 없으며 알 필요가 없다.


---

<br>

### 4) Dynamic Loading

- 프로세스 전체를 메모리에 미리 다 올리는 것이 아니라 해당 루틴이 불려질 때 load 하는 것

<br>

- memory utilization의 향상
- 가끔씩 사용되는 많은 양의 코드의 경우 유용(ex. 오류 처리 루틴)
- 운영체제의 특별한 지원 없이 프로그램 자체에서 구현가능(OS가 라이브러리를 통해 지원 가능)
- Loading의 의미 → 메모리로 올리는 것
- 주의: 운영체제가 관리하는 프로세스가 메모리에 올라갔다 - 다시 내려가는 동작(페이징 기법)이랑은 본질적으로 다름 → 하지만 요즘에는 용어를 혼용하기도 함


### 5) Overlays

<br>

- 메모리에 프로세스의 부분 중 실제 필요한 정보만을 올리는 것

- 프로세스의 크기가 메모리보다 클 때 유용
- 운영체제의 지원 없이 사용자에 의해 구현

<br>

- 작은 공간의 메모리를 사용하던 초창기 시스템에서 수작업으로 프로그래머가 구현
	- "Manual Overlay"라고도 일컫음
	- 프로그래밍이 매우 복잡


---

<br>

### 6) Swapping

- 프로세스 전체를 일시적으로 메모리에서 backing store로 쫓아내는 것

<br>
- 주의 : 페이징과는 프로세스 전체를 swap 한다는 점에서 본질적으로 다르지만, 용어를 혼용하기도 함

<br>
- Backing store(swap Area): Disk
	- 많은 사용자의 프로세스 이미지를 담을 만큼 충분히 빠르고 큰 저장공간

<br>
- Swap in / Swap out
	- 일반적으로 중기 스케줄러(swapper)에 의해 swap out시킬 프로세스 선정
	- priority based CPU scheduling algorithm
		- priority가 낮은 프로세스를 swapped out 시킴
		- priority가 높은 프로세스를 swapped in 시킴

<br>
- Compile time 혹은 load time binding에서는 원래 메모리 위치로 swap in을 해야함(그렇기 때문에 
Runtime Binding에서의 효율이 더 좋다 → 빈 메모리 영역 아무 곳에나 올릴 수 있으므로)

<br>
- swap time은 프로그램 전체를 스왑하는 큰 작업이기에, 대부분 transfer time(swap 되는 대상의 양에 비례하는 시간 ↔ seek time)이 차지


---

<br>

### 7) Linking

<br>
#### a. Linking

- Linking을 실행시간(execution time)까지 미루는 기법

<br>
- Linking: 여러군데에 존재하는 파일들을 묶어서 실행파일로 만들어 내는 것

<br>

#### b. Static Linking

- 라이브러리가 프로그램의 실행 파일 코드에 포함됨
- 실행 파일의 크기가 커짐
- 동일한 라이브러리를 각각의 프로세스가 메모리에 올리므로 메모리 낭비
	- ex) printf 함수의 라이브러리 코드

<br>

#### c. Dynamic Linking

- 라이브러리가 실행시 연결됨
- 라이브러리 호출 부분에 라이브러리 루틴의 위치를 찾기 위한 stub이라는 작은 코드를 둠
- 라이브러리가 이미 메모리에 있으면 그 루틴의 주소로 가고 없으면 디스크에서 읽어옴
- 운영체제의 도움이 필요
- SYN → shared library, 윈도우 - dll, 리눅스 - shared object


---

<br>

### 8) Allocation of Physical Memory

- 메모리는 일반적으로 두 영역으로 나뉘어 사용
	- OS 상주 영역
		- Interrupt vector와 함께 낮은 주소 영역 사용
	- 프로세스 영역
		- 높은 주소 영역 사용

<br>
- 2가지 할당 기법을 배운다. → 연속 할당과 불연속 할당
	- 연속할당
		- Fixed 파티션 할당
		- Variable 파티션 할당
	- 불연속 할당
		- 페이징
		- 세그멘테이션
		- 페이지드 세그멘테이션(혼합)


<br>
#### a. Contiguous Allocation(연속 할당)

- 각각의 프로세스가 메모리의 연속적인 공간에 적재되도록 하는 것

<br>

#### b. Fixed partition allocation(고정 분할)

- 물리적 메모리를 몇 개의 영구적 분할(파티션)로 나눔
- 분할의 크기가 모두 동일한 방식과 서로 다른 방식이 존재
- 분할당 하나의 프로그램 적재

<br>
- 융통성이 없음
	- 동시에 메모리에 로드되는 프로그램의 수가 고정됨
	- 최대 수행 가능 프로그램 크기 제한

<br>	
- Internal fragmentation 발생(external fragmentation도 발생)

<br>

#### c. Variable partition allocation(가변 분할)

- 프로그램의 크기를 고려해서 할당
- 분할의 크기, 개수가 동적으로 변함
- 기술적 관리 기법 필요
- External fragmentation 발생

<br>
- Hole(홀)
	- 가용 메모리 공간
	- 다양한 크기의 hole들이 메모리 여러곳에 흩어져 있음
	- 프로세스가 도착하면 수용가능한 홀을 할당
		- 할당공간, 가용공간(hole)운영체제는 다음의 정보를 유지

<br>

##### a) Dynamic Storage-Allocation Problem: 가변 분할 방식에서 크기 n인 요청을 만족하는 가장 적절한 hole을 찾는 문제

<br>
- First-fit
	- Size가 n 이상인 것 중 최초로 찾아지는 hole에 할당

<br>
- Best-fit
	- Size가 n 이상인 가장 작은 hole을 찾아서 할당
	- Hole들의 리스트가 크기순으로 정렬되지 않은 경우 모든 - hole의 리스트를 탐색해야함
	- 많은 수의 아주 작은 hole들이 생성됨
	
<br>
- Worst-fit
	- 가장 큰 hole에 할당
	- 역시 모든 리스트를 탐색해야 함
	- 상대적으로 아주 큰 hole들이 생성됨
	→ 실험적인 결과로, First-fit과 Best-fit이 속도와 공간 이용률 측면에서 효과적인 것으로 알려짐


<br>
##### b) compaction
	- 외부조각 문제를 해결하는 한가지 방법
	- 사용 중인 메모리 영역을 한군데로 몰고 hole들을 한곳으로 몰아 큰 block를 만드는 것
	- 매우 비용이 많이드는 방법임
	- 최소한의 메모리 이동으로 compaction하는 방법(매우 복잡한 문제)
	- Compaction은 프로세스의 주소가 실행시간에 동적으로 재배치 가능한 경우에만 수행될 수 있다.(런타임 바인딩)


<br>

#### d. Noncontiguous Allocation(불연속 할당)

- 하나의 프로세스가 메모리의 여러 영역에 분산되어 올라갈 수 있음(단지 레지스터 2개로 동작하는 MMU로는 수행이 어려움)

<br>

##### a) Paging(균등하게 자름)

- 페이지 테이블

- 어디에 있어야 할까?: 메인 메모리에 상주한다

<br>
- page-table base register(BTBR)가 page table을 가리킨다.
- page-table length register(PTLR)가 테이블 크기를 보관

<br>
- 모든 메모리 접근 연산에는 2번의 메모리 엑세스가 필요(page table접근 한번, 실제 data/instruction 접근 1번)
	- 속도 향상을 위해 associative register 혹은 translation look-aside buffer(TLB)라고 불리는 고속의 lookup hadware cache사용

<br>
- d는 오프셋이므로 변경되지 않음
- P라는 주소가 TLB에 있는지 검색해서 확인하는 과정을 거침

<br>
- Associative Register(TLB): Parallel Search가 가능
	- TLB에는 page table 중 일부만 존재

<br>
- Address translation
	- page table 중 일부가 associative register에 보관되어 있음
	- 만약 해당 page #가 associative register에 있는 경우 곧바로 frame #을 얻음
	- 그렇지 않은 경우 main memory에 있는 page table로부터 frame#을 얻음
	- TLB는 context swiching이 일어날 때 flush됨(remove od entires) - page table은 프로세스 마다 존재하기에 다른 프로세스로 cpu가 넘어가면 모든 엔트리를 비워야함
	
<br>
- Effective Access Time
	- Associative register lookup time = e
	- memory cycle time = 1
	- Hit ratio = alpha (associative register에서 찾아지는 비율)
	- alpha가 거의 1에 가까운 값이므로, 2보다 훨씬 작은 값을 얻어 속도 향상을 확인할 수 있음, miss되면 메모리에 접근을 2번 해야함

<br>

##### b) Two-Level Page Table

- 공간을 줄이는게 목적이다. (* 시간은 더 걸림)

<br>
- 현대의 컴퓨터는 address space가 매우 큰 프로그램 지원, 32 bit address 사용시: 2^32(= 4G)의 주소 공간
	- page size가 4K일때 1M개의 page table entry 필요(사용되지 않는 영역을 위해서도 전부 메모리의 크기만큼 엔트리를 가지고 있어야 한다 → 배열(테이블) 구조이므로 인덱스 접근을 위해)
	- 각 page entry가 4B시 프로세스 당 4M의 page table 필요
	- 그러나, 대부분의 프로그램은 4G의 주소 공간 중 지극히 일부분만 사용하므로 page table 공간이 심하게 낭비됨
	
<br>
→ page table 자체를 page로 구성

<br>
→ 사용되지 않는 주소 공간에 대한 outer page table의 엔트리 값은 NULL(대응하는 inner page table이 없음)이기 때문에, 공간 절약이 가능하다.

<br>
- 2의 12승은 4K이므로 4K size 페이지 표현을 위해 12bit(2^12=4K) page offset이 사용됨
 
<br>

##### c) Multilevel Paging and Performance


- Address space가 더 커지면 다단계 페이지 테이블 필요
각 단계의 페이지 테이블이 메모리에 존재하므로 logical address의 physical address 변환에 더 많은 메모리 접근 필요(4단계 테이블을 사용하면 4번 접근해야 하므로 4배의 시간이 걸림)

<br>
- 그렇기에 TLB를 통해 메모리 접근 시간을 줄일 수 있음

<br>
- 4단계 페이지 테이블을 사용하는 경우
	- 메모리 접근 시간이 100ns, TLB 접근 시간이 20ns이고
	- TLB hit ratio가 98%인 경우
		- effective memory access time = 0.98 * 12 + 0.02 * 520 = 128 nanoseconds
		- 결과적으로 주소 변환을 위해 28ns만 소요된다

<br>

##### d) Memory Protection

- Page table의 각 entry 마다 아래의 bit를 둔다.

<br>
- Protection bit
	- page에 대한 접근 권한(read/write/read-only)

<br>
- Valid-invalid bit
	- Valid는 해당 주소의 frame에 그 프로세스를 구성하는 유효한 내용이 있음을 뜻함(접근 허용)
	- Invalid는 해당 주소의 frame에 유효한 내용이 없음을 뜻함(접근 불허)
	- 프로세스가 그 주소 부분을 사용하지 않는 경우
		- 해당 페이지가 메모리에 올라와 있지 않고 swap area(disk)에 있는 경우

<br>
- v와 i 비트 정보를 가지고 사용하는지 안하는지를 나타냄

<br>

##### e) Inverted Page Table(역방향 페이지테이블 → 공간 오버헤드를 줄이기 위해서)

- 시스템 안에 페이지테이블을 하나만 둔다. 물리적 메모리의 프레임 갯수만큼 페이지 테이블의 엔트리가 존재하게 됨(밑의 그림에서 f)

- 물리 → 논리 순으로 찾기 때문에 역방향 페이지 테이블이라고 한다.

<br>
- page table이 매우 큰 이유
	- 모든 프로세스 별로 그 논리 주소에 대응하는 모든 페이지에 대해 page table entry가 존재
	- 대응하는 page가 메모리에 있든 아니든 간에 페이지 테이블에는 엔트리로 존재한다

<br>
- Inverted page table이란?
	- Page 프레임 하나당 페이지 테이블에 하나의 엔트리를 둔 것 (system - wide)
	- 각 page table entry는 각각의 물리적 메모리의 page frame이 담고 있는 내용 표시(process-id, process의 logical address - 실제 logical address는 프로세스 마다 별도로 있는 것이기 때문에.)
	- 단점 : 테이블 전체를 탐색해야 함 (공간 overhead는 이득이지만, 시간적으로는 trade-off)
	- 조치 : associative register 사용(expensive) - 병렬적으로 동시에 탐색할 수 있게

<br>

##### f) Shared pages

- 같은 프로그램이 여러개 실행될 경우 / IPC랑은 다른점에 유의!!! 커뮤니케이션 목적이 아니고 read-only임

- Shared Code
	- Re-entrant Code(= Pure code) / 재진입 가능 코드
	- read-only로 하여 프로세스 간에 하나의 code만 메모리에 올림(eg. 텍스트 에디터, 컴파일러, 윈도우 시스템즈)
	- Shared Code는 모든 프로세스의 logical address - space에서 동일한 위치에 있어야 함

<br>
- Private code and data
	- 각 프로세스들은 독자적으로 메모리에 올림
	- logical address space의 아무 곳에 와도 무방



---


<br>

### 9) Segmentation(의미 단위 기준으로 자름)

<br>
- 프로그램은 의미 단위인 여러개의 segment로 구성
	- 작게는 프로그램을 구성하는 함수 하나하나를 세그먼트로 정의
	- 크게는 프로그램 전체를 하나의 세그먼트로 정의 가능
	- 일반적으로는 code, data, stack 부분이 하나씩의 세그먼트로 정의됨
	
<br>
- Segment는 다음과 같은 logical unit 들임
	- main()
	- function
	- global variables
	- stack
	- symbol table, arrays

<br>

#### a. Segmentation Architecture

- Logical address는 다음의 두가지로 구성
	- segment-number(s)
	- offset(d)

<br>
- Segment table
	- each table entry has:
		- base - starting physical address of the segment
		- limit - length of the segment

<br>
- segment-table base register(STBR)
	- 물리적 메모리에서의 segment table의 위치

<br>
- segment - table length register(STLR)
	- 프로그램이 사용하는 segment의 수
		- segment number s is legal if s < STLR

<br>

#### b. Segment 장단점

- Q. page보다 공간적으로도 유리한가?
	- yes, 페이징은 일반적으로 페이지 개수가 너무 많기 때문에 테이블로인한 메모리 낭비가 심하다.

<br>

##### a) Protection(장)

- 각 세그먼트 별로 protection bit가 있음

<br>
- each entry:
	- Valid bit = 0 → illegal segment
	- Read/Write/Execution 권한 bit

<br>

##### b) Sharing(장)

- shared segment - 일반적으로 코드영역 같은 경우 같은 프로그램이면 공유해도 상관 없기 때문에!

- same segment number - 같은 논리적인 주소상에 있어야 하므로 세그먼트 번호가 같아야 함

→ segment는 의미 단위이기 때문에 공유와 보안에 있어 paging보다 훨씬 효과적이다 (eg. 의미 단위로 권한부여 등)

<br>

##### c) Allocation(단)

- first fit/ best fit

- external fragmentation 발생

→ 세그먼트들의 길이가 동일하지 않으므로 가변분할 방식에서와 동일한 문제점들이 발생(외부조각, hole)



---


<br>

### 9) Paged Segmentation(위 방법들을 혼합)

- 세그먼트 당 페이지 테이블이 존재함(페이징은 프로세스당 페이지테이블)

- STBR에서 세그먼트 테이블을 찾음 → 세그먼트가 갖고 있는 페이지 테이블의 시작위치를 찾음

<br>
- 다단계 테이블과 같이 d를 p와 d`로 나누게 됨
	- 기존 세그먼트기법에서 발생하는 Allocation 문제가 발생하지 않는다.
	- 기존에 갖는 장점은 그대로 가능(의미 단위로 필요한 일들은 세그먼트 차원에서 해주기 때문)



---

<br><br>

# 2. Virtual Memory

- 이 챕터에서는 운영체제가 페이징 기법을 사용하는 것을 가정한다. (대부분의 시스템도 페이징 기법을 채택함)

<br>

### 1) Demand Paging

<br>
- 실제로 필요할 때 page를 메모리에 올리는 것
	- I/O 양의 감소
	- Memory사용량 감소
	- 빠른 응답 시간
	- 더 많은 사용자 수용

<br>
- Valid / Invalid bit의 사용
	- Invalid의 의미
		- 사용되지 않는 주소 영역인 경우(아래 그림의 6, 7번)
	- 페이지가 물리적 메모리에 없는 경우(아래 그림의 1, 3, 4)
	- 처음에는 모든 page entry가 invalid로 초기화
	- address translation 시에 invalid bit이 set되어 있으면
	→ “Page Fault”

<br>
- 원통이 swap area(disk/ backing store)
 

---

<br>

### 2) Page Fault

<br>
- Invalid page를 접근하면 MMU가 trap을 발생시킴(페이지 폴트 트랩)
- 커널 모드로 들어가서 페이지 폴트 핸들러가 invoke 됨

<br>
- Page Falut의 처리 순서 :
	- Invalid reference? (eg. bad address, protection violation) → abort process
	- Get an empty page frame (없으면 뺏어온다: replace)
	- 해당 페이지를 disk에서 memory로 읽어온다.
	- disk I/O가 끝나기까지 이 프로세스는 CPU를 preempt 당함(block)
	- Disk read가 끝나면
		- 1) page tables entry 기록, 
		- 2) valid/invalid bit 를 “valid”로 수정
	- ready queue에 process를 insert → dispatch later

<br>
- 이 프로세스가 CPU를 잡고 다시 running
- 아까 중단되었던 instruction을 재개


---

<br>
### 3) Demand Paging의 성능

<br>
- Page Falut Rate 0 ≤ p ≤ 1.0 (일반적으로 0에 가깝다.)
	- 0이면 페이지 폴트가 발생하지 않는것, 1이면 매번 발생하는 것

<br>
- 페이지폴트 처리 시간, 스왑 아웃, 스왑인, 재시작 비용 등
 


---

<br>

### 4) Free Frame이 없는 경우 → page replacement 발생

<br>
- Page Replacement
	- 어떤 frame을 빼앗아 올지 결정해야 함
	- 곧바로 사용되지 않을 page를 쫓아내는 것이 좋음
	- 동일한 페이지가 여러 번 메모리에서 쫓겨났다가 다시 들어올 수 있음

<br>
- 교체 알고리즘
	- 페이지 폴트 rate을 최소화 하는 것이 목표

<br>
- 알고리즘의 평가
	- 주어진 page reference string에 대해 pge falut를 얼마나 내는지 조사

<br>
- reference string의 예
	- 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5(일련의 페이지 번호)


---

<br>

### 5) 페이지 교체 알고리즘의 종류

#### a. Optimal Algorithm(빌레디 알고리즘)

- 레퍼런스의 스트링을 미리 알고 있다는 가정하에 설계된 offline 알고리즘이다. 비교를 위한 알고리즘임

- 어떤 알고리즘을 쓰더라도 이 알고리즘 보다 적은 페이지 폴트를 발생시킬 수는 없다.


<br>

#### b. FIFO(First In First Out) Algorithm

- FIFO Anomaly(Belady’s Anomaly)
	- 더 많은 프레임을 가질 수록 페이지 폴트가 더 발생한다.

<br>

#### c. LRU(Least Recently Used) Algorithm

- 가장 덜 최근에 사용된 → 가장 오래전에 참조된 것을 지운다.

<br>

#### d. LFU(Least Frequently Used) Algorithm

- 참조 횟수가 가장 적은 페이지를 지움
	- 최저 참조 횟수인 페이지가 여러개 있는 경우?
	- LFU 알고리즘 자체에서는 여러 page 중 임의로 선정한다
	- 성능 향상을 위해 가장 오래 전에 참조된 page를 지우게 구현할 수도 있다.

<br>
- 장단점
	- LRU처럼 직전 참조 시점만 보는 것이 아니라 장기적인 시간 규모를 보기 때문에 page의 인기도를 좀 더 정확히 반영할 수 있음
	- 참조 시점의 최근성을 반영하지 못함
	- LRU보다 구현이 복잡함

<br>

#### e. LRU와 LFU의 비교


- LRU는 몇번이 참조되었든 가장 오래되면 무시하는게 단점
- LFU는 최근성을 반영하지 못하는게 단점(위 그림처럼 4번이 앞으로도 많이 쓰일 수 있는데 4번을 쫓아내게 됨)

<br>

#### f. LRU와 LFU 알고리즘의 구현

- LRU → Linked List

<br>
- LFU → Heap(힙을 사용하지 않으면 O(N)이 걸리게 되므로)
	- 높이가 n개 일때 log(n)


---

<br>
### 6) 다양한 캐싱 환경

- 캐싱 기법
	- 한정된 빠른공간(캐시)에 요청된 데이터를 저장해 두었다가 후속 요청 시 캐쉬로부터 직접 서비스하는 방식
	- 페이징 시스템(디스크의 swap area) 외에도, 캐시 메모리, 버퍼 캐싱(디스크의 file system), 웹 캐싱 등 다양한 분야에서 사용
	
<br>	
- 캐시 운영의 시간 제약 1 :
	- 교체 알고리즘에서 삭제할 항목을 결정하는 일에 지나치게 - 많은 시간이 걸리는 경우 실제 시스템에서 사용할 수 없음
	- 버퍼 캐싱이나 웹 캐싱의 경우 → LFU, LRU 사용 가능
		- O(1)에서 O(logN)정도까지 허용

<br>		
- 캐시 운영의 시간 제약 2 :
	- 페이징 시스템인 경우 → 사용할 수 없음
	- 페이지 폴트인 경우에만 OS가 관여함
	- 페이지가 이미 메모리에 존재하는 경우 참조시각 등의 정보를 OS가 알 수 없음
	- O(1)인 LRU의 list 조작조차 불가능(운영체제는 뭐가 제일 최근에 사용됐는지 알 수 없음/ 페이지 폴트가 날때만 운영체제에 CPU가 넘어가지 않기 때문에!!!)

<br>	
- 그럼 뭘 사용해야 되나? → 아래에서 살펴본다


---

<br>

### 7) Clock Algorithm

- LRU의 근사 알고리즘
- 페이징 교체에서 일반적으로 사용되는 알고리즘임

<br>	
- 여러 명칭으로 불림
	- Second Chance Algorithm
	- NUR(Not Used Recently) 또는 NRU(Not Recently Used) → 최근에 사용되지 않은 페이지

<br>	
- 동작 방식
	- 페이지 폴트 발생 시 Reference bit(하드웨어가 기록하는 것)을 사용해서 교체 대상 페이지 선정(circular list)
	- reference bit가 0인 것을 찾을 때까지 포인터를 하나씩 앞으로 이동
	- 포인터 이동하는 중에 reference bit 1은 모두 0으로 바꿈
	- Reference bit이 0인 것을 찾으면 그 페이지를 교체
	한바퀴 되돌아와서도(= second chance) 0이면 그때는 replace 교체당함
	- 자주 사용되는 페이지라면 second chance가 올때 1(시계바늘이 돌때 한번 더 참조되었으니 최근에 참조되었다는 뜻)

<br>	
- Clock Algorithm의 개선
	- reference bit과 modified bit(dirty bit)을 함께 사용
	- reference bit = 1 : 최근에 참조 된 페이지
	- modified bit = 1 : 최근에 변경된 페이지 (I/O, write를 동반하는 페이지 - 한번 쓰여졌기 때문에 backing store에 수정된 내용을 반영을 한다음에 메모리에서 내려야 함)


---

<br>

### 8) Allocation

#### a. Page Frame의 Allocation

- 프로그램이 실행되면서 충분한 페이지가 주어지지 않으면 빈번한 page fault가 발생할 수 있기 때문에 이를 위한 고민

<br>	
- Allocation Problem: 각 process에 얼마만큼의 page frame을 할당할 것인가?

<br>	
- Allocation의 필요성
	- 메모리 참조 명령어 수행 시 명령어, 데이터 등 여러 페이지 동시 참조
		- 명령어 수행을 위해 최소한 할당되어야 하는 frame의 수가 있음
	- Loop를 구성하는 page들은 한꺼번에 allocate 되는 것이 유리함
		- 최소한의 allocation이 없으면 매 loop마다 page fault

<br>	
- Allocation Scheme
	- Equal Allocation: 모든 프로세스에 똑같은 개수 할당
	- Proprtional Allocation: 프로세스 크기에 비례하여 할당
	- Priority Allocation: 프로세스의 Priority에 따라 다르게 할당


---

<br>

### 9) Global vs Local Replacement

#### a. Global Replacement

- Replace 시 다른 process에 할당 된 frame을 빼앗아 올 수 있다.
- Process별 할당량을 조절하는 또 다른 방법임
- FIFO, LRU, LFU 등의 알고리즘을 Global Replacement로 사용 시 해당 - 최소한 필요로 하는 프로그램을 올리는 할당의 효과가 없음
- Working set, PFF 알고리즘 사용 - 최소한 필요로 하는 프로그램을 올리는 할당의 효과가 있음

<br>

#### b. Local Replacement(위의 할당을 진행한 경우)

- 자신에게 할당 된 Frame 내에서만 Replacement
- FIFO, LRU, LFU등의 알고리즘을 process 별로 운영 시


---

<br>

### 10) Trashing

- 프로세스의 원활한 수행에 필요한 최소한의 page frame 수를 할당받지 못한 경우 발생

<br>	
- 페이지 폴트 rate가 매우 높아짐
- CPU Utilization이 낮아짐
- OS는 MPD(Multiprogramming degree: 프로그램의 숫자)를 높여야 한다고 판단(일반적으로 MPD가 올라가면 utilization이 올라가기 때문에 이렇게 판단하게 되는 것)
- 또 다른 프로세스가 시스템에 추가됨(higher MPD)
- 프로세스 당 할당 된 frame의 수가 더욱 감소
- 프로세스는 page의 swap in/ swap out으로 매우 바쁨
- 대부분의 시간에 CPU는 한가함
- low throughput(낮은 데이터 처리량)

<br>	
- MPD에 따라 CPU Utilization이 지속적으로 높아지다가 trashing이 발생한 순간 급격히 감소하게 된다. 각 프로그램에 할당된 메모리가 너무 작기 때문에 swap이 빈번하게 발생해서!
→ 이를 해결하기 위해 동시에 메모리에 올라가 있는 프로세스의 수를 조절해야함. 아래의 알고리즘이 그것을 해결하기 위한 방법이다.



---

<br>

### 11) Working-Set Model

#### a. Locality of reference

- 프로세스는 특정 시간 동안 일정 장소만을 집중적으로 참조한다.
- 집중적으로 참조되는 해당 page들의 집합을 locality set이라 함

<br>

#### b. Working-set Model

- Locality에 기반하여 프로세스가 일정시간 동안 원활하게 수행되기 위해 한꺼번에 메모리에 올라와 있어야 하는 page들의 집합을 Working Set이라 정의함(locality set의 개념)

- Working Set 모델에서는 process의 Working Set 전체가 메모리에 올라와 있어야 수행되고 그렇지 않을 경우 모든 frame을 반납한 후 swap out(suspended)

- Trashing을 방지함
- Multiprogramming degree(MPD)를 결정함


---

<br>

### 12) Working-Set Algorithm

<br>
- Working Set의 결정 1 :
	- Working set window를 통해 알아냄(시간에 따라 계속 바뀐다)
	- window size가 Δ인 경우
		- 시각 t(i)에서의 Working set WS(t(i))
			- Time Interval[t(i)-Δ, t(i)] 사이에 참조된 서로 다른 페이지들의 집합

<br>
- Working Set의 결정 2 : 
	- Working set에 속한 page는 메모리에 유지, 속하지 않은 것은 버림 (즉, 참조된 후 Δ시간 동안 해당 page를 메모리에 유지한 후 버림)

- 워킹셋이 1,2,5,6,7 이므로 5개의 공간을 줄 수 있으면 유지하고 아니면 이 프로세스를 swap out / suspended 시킴


---


<br>

### 12) PFF(Page-Fault Frequency) Scheme

- 이 방식은 위의 방식처럼 워킹셋을 추정하는게 아니라 현재시점의 각 프로세스의 페이지 폴트의 값을 보고 판단한다.

<br>
- page-fault rate의 상한값과 하한값을 둔다
	- Page fault rate이 상한값을 넘으면 frame을 더 할당한다
	- Page fault rate이 하한값 이하이면 할당 frame 수를 줄인다

<br>
- 빈 frame이 없으면 일부 프로세스를 swap out


---

<br>

### 13) Page Size의 결정

- Page Size를 감소시키면
	- 페이지 수 증가
	- 페이지 테이블 크기 증가(메모리 낭비가 심해지지만 테이블 내부에서 사용되지 않은 부분이 적어지므로 trade off 관계)
	- Internal fragmentation 감소
	- Disk transfer의 효율성 감소
		- Seek/rotation vs transfer (seek하는 시간이 길어지기 때문에…)

<br>
- 또한, Page Size를 감소시키면 
	- 필요한 정보만 메모리에 올라와 메모리 이용이 효율적
		- Locality의 활용 측면에서는 좋지 않음(페이지 크기가 크면 - 하나만 올려 놓으면 다음에 폴트가 날 확률이 낮아지기 때문)

<br>
- Trend
	- 그렇기 떄문에 Larger page size가 요즘에 추세이다.


# 3. File System

### 1) File And File System

#### a. File

- “A named Collection of related information”

- 일반적으로 비휘발성의 보조기억장치에 저장

- 운영체제는 다양한 저장장치를 file이라는 동일한 논리적 단위로 볼 수 있게 해줌

- Operation
	- create, read, write, reposition(lseek) - 파일의 포인터를 이동, delete, open, close 등 

<br>
#### b. File attribute(혹은 파일의 metadata라고도 일컬음)

- 파일 자체의 내용이 아니라 파일을 관리하기 위한 각종 정보들
- 파일 이름, 유형, 저장된 위치, 파일 사이즈
- 접근 권한(읽기/쓰기/실행), 시간(생성/변경/사용), 소유자 등

<br>

#### c. File System

- 운영체제에서 파일을 관리하는 부분
- 파일 및 파일의 메타데이터, 디렉토리 정보 등을 관리
- 파일의 저장방법 결정
- 파일 보호 등

--- 


<br><br>

### 2) Directory and Logical Disk

<br>

#### a. Directory

- 파일의 메타데이터 중 일부를 보관하고 있는 일종의 특별한 파일
그 디렉토리에 속한 파일 이름 및 파일 attribute 들

<br>
- Operation :
	- search for a file, create a file, delete a file
	- list a directory(리스트를 보는 것), rename a file, traverse the file system(파일시스템 전체를 탐색)

<br>

#### b. Partition(= Logical disk)

- 하나의 디스크 안에 여러 파티션을 두는게 일반적
- 여러 개의 물리적인 디스크를 하나의 파티션으로 구성하기도 함
- 디스크를 파티션으로 구성한 뒤 각각의 파티션에 file s ystem을 깔거나 swapping 등 다른 용도로 사용할 수 있음


--- 


<br><br>

### 3) Open()

- 파일의 메타데이터를 메모리로 올리는 것 (system call의 일종)
- e.g) open(”/a/b”)를 실행하면 일어나는 일

<br>

#### a. 디스크로부터 파일 c의 메타데이터를 메모리로 가지고 옴
- 이를 위하여 directory path를 search
- 루트 디렉토리 /를 open하고 그 안에서 파일 a의 위치를 획득
- 파일 “a”를 open 한 후 read 하여 그 안에서 파일 b의 위치 획득
- 파일 “b”를 open 한다.

<br>

#### b. Directory Path 의 search에 너무 많은 시간이 소요되기 때문에 Open을 read/write와 별도로 둔다.

- 한번 open한 파일은 read/write 시 directory search 불필요

<br>

#### c. Open file table
- 현재 open 된 파일들의 메타데이터 보관소(in memory)
- 디스크의 메타데이터보다 몇가지 정보가 추가
- Open한 프로세스의 수
- File offset: 프로세스가 파일 어느위치에 접근 중인지 표시(별도 테이블 필요)

<br>

#### d. File descriptor(file handle, file control block)

- Open file table에 대한 위치 정보(프로세스 별)


--- 


<br><br>

### 4) File Protection

- 각 파일에 대해 누구에게 어떤 유형의 접근(read/write/execution)을 허락할 것인가?

<br>

#### a. Access Control 방법

##### a) Access Control Matrix(행렬)

- Access Control list: 파일별로 누구에게 어떤 접근 권한이 있는지 표시(Linked List로)
- Capability: 사용자 별로 자신의 접근 권한을 가진 파일 및 해당 권한 표시

<br>

##### b) Grouping(일반적인 운영체제에서 사용하는 방법)

- 전체 user를 owner, group, public의 세 그룹으로 구분
- 각 파일에 대해 세 그룹의 접근 권한(rwx)를 3비트 씩으로 표시(9개의 비트로) - e.g)UNIX

<br>

##### c) Password

- 파일마다 패스워드를 두는방법(디렉토리 파일에 두는 방법도 가능)
- 모든 접근 권한에 대해 하나의 password: all-or-nothing
- 접근 권한 별 패스워드 → 암기 문제와 관리 문제가 있음
 
--- 


<br><br>

### 5) File System의 Mounting

- 다른 파일시스템의 루트디렉토리로 접근할 수 있게 해줌


--- 


<br><br>

### 6) Access Method 접근 방법

- 시스템이 제공하는 파일 정보의 접근 방식

<br>

### a) 순차 접근(sequential access)

- 카세트 테이프를 사용하는 방식처럼 접근
- 읽거나 쓰면 offset은 자동적으로 증가

<br>

### 직접 접근(direct access, random access)

- LP 레코드 판과 같이 접근하도록 함
- 파일을 구성하는 레코드를 임의의 순서로 접근할 수 있음


--- 


<br><br>

### 7) Allocation

#### a. Allocation of File Data in Disk

- 임의의 크기의 파일을 블럭단위로 저장하고 있음

<br>

#### b. Contiguous Allocation

- 하나의 파일이 디스크에 연속해서 저장되는 방법

<br>

##### a) 장점

- Fast I/O(공간 효율성 보다는 속도 효율성이 중요한 경우!!)
	- 한번의 seek/rotation으로 많은 바이트 transfer
	- realtime file용으로, 또는 이미 run 중이던 process의 swapping 용도로 사용

<br>
- Direct access(=random access) 가능

<br>

##### b) 단점

- 외부조각이 생길 수 있다.

<br>
- 파일 grow가 어려움
	- 파일 생성 시 얼마나 큰 hole을 배정할 것인가?
	- grow 가능 vs 낭비(internal fragmentation) → trade off

<br>

#### c. Linked Allocation

##### a) 장점
- 외부조각 발생 안함

##### b) 단점
- No random access(순차적 접근해야해서 시간이 많이 듬)

<br>
- Reliability 문제
	- 한 섹터가 고장나 pointer가 유실되면 많은 부분을 잃음

<br>
- Pointer를 위한 공간이 block의 일부가 되어 공간 효율성을 떨어뜨림 -> 작은 문제이다.
	- 512 bytes/sector, 4bytes/pointer

<br>
- 변형
	- FAT(File-Allocation Table) 파일 시스템
	- 포인터를 별도의 위치에 보관하여 reliability와 공간 효율성 문제 해결


<br>

#### d. Indexed Allocation

- 인덱스 블록 내부에 파일이 저장되어있는 블록들의 위치를 저장해놓는 방법

<br>

##### a) 장점

- External fragmentation이 발생하지 않음
- Direct access 가능

<br>

##### b) 단점
- Small file의 경우 공간 낭비(실제로 많은 file들이 small) → 블럭이 2개 필요하기 때문에!
- Too Large file의 경우 하나의 block로 index를 저장하기에 부족

<br>
- 해결방안
	- Linked scheme
	- multi-level index

- 위의 방법들은 이론적인방법, 아래부터는 실제로 사용되는 파일시스템에 대해서 다룬다.

--- 


<br><br>

### 8) UNIX 파일 시스템

<br>

#### a. Boot block
- 어떤 파일 시스템이던 공통적으로 갖고 있는 구조
- 부팅에 필요한 정보를 가지고 있다.(bootstrap loader)

<br>

#### b. Super blcok

- 파일 시스템에 관한 총체적인 정보를 갖고 있다.(어디가 빈 블록이고 어디가 사용되는 블럭인지? 어디까지가 Inode 블록인지? 등)

<br>

#### c. Inode List

- 파일 이름을 제외한 파일의 모든 메타데이터를 저장 → 파일 이름은 디렉터리가 갖고 있음
- 파일 하나당 할당이 됨
- 큰 파일의 경우 indirect를 사용하여 데이터 블럭 위치를 갖고 있음(그림 참조)

<br>

#### d. Data block

- 실제 데이터를 갖고 있는 부분

--- 


<br><br>

### 9) FAT 파일 시스템

#### a. Linked Allocation 사용

- FAT 배열을 확인해서 다음 위치를 알 수 있다.
- 직접 접근도 가능하다

<br>

#### a. Free - Space Management

- 빈 공간을 관리하는 방법

<br>

##### a) Bit map or Bit Vector

- 특성
	- 부가적인 공간을 필요로 함
	- 연속적인 n개의 free block를 찾는데 효과적이다

<br>

##### b) Linked List

- 모든 free block들을 링크로 연결(free link)
- 연속적인 가용공간을 찾는 것은 쉽지 않다
- 공간의 낭비가 없다

<br>

##### c) Grouping

- Linked List 방법의 변형
- 첫번째 free block이 n개의 pointer를 가짐
- n-1 pointer는 free data block를 가리킴
- 마지막 pointer가 가리키는 block는 또 다시 n pointer를 가짐

<br>

##### d) Counting

- 프로그램들이 종종 여러개의 연속적인 block를 할당하고 반납한다는 성질에 착안
- first free block, # of contiguous free blocks를 유지 -> 어디가 비어있는지, 몇개가 연속적으로 비어있는지에 대한 정보


--- 


<br><br>

### 10) Directory Implementation

<br>
#### a. Linear List
- File name, file의 메타데이터의 list
- 구현이 간단
- 디렉토리 내에 파일이 있는지 찾기 위해서 선형 탐색이 필요(time - consuming)

<br>
#### b. Hash Table
- linear list + hashing
- Hash table은 file name을 이 파일의 linear list의 위치로 바꾸어줌
- search time을 없앰
- Collision 발생 가능

<br>
#### c. File의 메타데이터 보관 위치

<br>
- 디렉토리 내에 직접 보관하는 경우

<br>
- 디렉토리에는 포인터를 두고 다른곳에 보관
	- inode(UNIX), FAT 등

<br>
- Long file name의 지원
	- <file name, file의 metadata>의 list에서 각 엔트리는 일반적으로 고정 크기
	- file name이 고정 크기의 entry 길이보다 길어지는 경우 entry의 마지막 부분에 이름의 뒷부분이 위치한 곳의 포인터를 두는 방법
	- 이름의 나머지 부분은 동일한 directory file의 일부에 존재


--- 


<br><br>

### 11) VFS and NFS

#### a. Virtual File System(VFS)
- 서로 다른 다양한 file system에 대해 동일한 시스템 콜 인터페이스(API)를 통해 접근할 수 있게 해주는 OS의 layer

<br>

#### b. Network File System(NFS)
- 분산 시스템에서는 네트워크를 통해 파일이 공유 될 수 있음
- NFS는 분산 환경에서의 대표적인 파일 공유 방법임

--- 


<br><br>

### 12) Page Cache and Buffer Cache

<br>
#### a) Page Cache

- 가상메모리의 페이징 시스템에서 사용하는 페이지 프레임을 캐싱의 관점에서 설명하는 용어
- Memory-Mapped I/O를 쓰는 경우 file의 I/O에서도 page cache 사용

<br>

#### b) Memory-Mapped I/O

<br>
- File의 일부를 virtual memory에 mapping 시킴
- 매핑시킨 영역에 대한 메모리 접근 연산은 파일의 입출력을 수행하게 함

<br>
- read() system call과 비교
	- read: 카피해서 해당 프로세스의 메모리 공간에 제공하게 됨
	- m-Mapped I/O: 메모리에 접근하면 그 파일에 접근하게 됨 - 더 빠르다 / copy overhead가 없고 운영체제의 도움을 받을 필요가 없음 / 단, 공유 자원의 문제가 있을 수도 있음 - read /write 콜의 경우 copy해서 전달하기 떄문에 그런 문제가 없음


<br>

#### c) Buffer Cache

- 파일시스템을 통한 I/O 연산은 메모리의 특정 영역인 buffer cache 사용

<br>
- 파일 사용의 Locaility 활용
	- 한번 읽어온 block에 대한 후속 요청 시 buffer cache에서 즉시 전달

<br>
- 모든 프로세스가 공용으로 사용
- Replacement algorithm 필요(LRU, LFU 등)

<br>

#### d) Unified Buffer Cache

- 최근의 OS에서는 기존의 buffer cache가 page cache에 통합됨(e.g Linux)

- 왼쪽의 경우 read, write system call이 있을때는 그 내용이 buffer cache에 있든 없든 운영체제에 요청을 해서 받아와야 하고, M-Mapped를 쓰게되면 운영체제를 부르지 않고(커널의 도움을 받지 않고) 프로세스가 자신의 메모리에 접근하면서 I/O를 하게됨

- 우측의 경우도 read, write 시 운영체제에 CPU 넘어감 → 캐시에 있는 내용이면 그냥 카피해 주면되고 아니라면 디스크의 파일시스템에서 읽어서 전달. M-Mapped의 경우는 사용자 프로그램의 주소영역에 페이지 캐시가 매핑되어 프로세스가 직접 읽고 쓰고 할 수 있다.

- code 부분은 swap영역으로 가는게 아니고 파일시스템의 실행파일에 파일의 형태로 존재함(memory-mapped I/O - Loader)

- 데이터 파일의 경우 swap으로 가는게 아니고, 수정된 내용을 반영해서 파일시스템에다가 써줘야 함

- 다른 프로세스가 해당 파일을 가져와도 동일한 물리 메모리 영역에서 공유한다


---

<br><br>

# 4. Disk Management And Scheduling

<br>
### 1) Disk의 구조

- logical block
- 디스크의 외부에서 보는 디스크의 단위 정보 저장 공간들
- 주소를 가진 1차원 배열처럼 취급
- 정보를 전송하는 최소 단위

<br>
- Sector
- Logical block이 물리적인 디스크에 매핑된 위치
- Sector 0은 최외곽 실린더의 첫 트랙에 있는 첫번째 섹터이다 → 약속!

<br>

### 2) Disk Scheduling


- Access time의 구성

- Seek time (대부분의 시간을 차지함)
- 헤드를 해당 실린더로 움직이는데 걸리는 시간

- Rotational latency
- 헤드가 원하는 섹터에 도달하기까지 걸리는 회전 지연시간

- Transfer time (작은 시간)
- 실제 데이터 전송 시간

- Disk bandwidth
- 단위 시간 당 전송 된 바이트 수

- Disk Scheduling
- Seek time을 최소화하는 것이 목표
- Seek time = seek distance

<br>

### 3) Disk Management


- Physical formatting(low-levlel formatting)

- 디스크를 컨트롤러가 읽고 쓸 수 있도록 섹터들로 나누는 과정
- 각 섹터는 header + 실제 data(보통 512bytes) + trailer로 구성
- header와 trailer는 sector number, ECC(Error-Correcting Code - 데이터를 작게 요약, 나중에 대조해서 오류를 검출하는 역할을 함) 등의 정보가 저장되며 Controller가 직접 접근 및 운영

<br>
- Partitioning

- 디스크를 하나 이상의 실린더 그룹으로 나누는 과정
- OS는 이것을 독립적 Disk로 취급(logical disk)

<br>
- Logical Formatting

- 파일 시스템을 만드는 것
- FAT, iNode, free space 등의 구조 포함

<br>
- Booting

- ROM에 있는 Small Bootstrap loader의 실행
- sector 0(boot block)을 메모리에 올려 load하여 실행
- sector 0은 Full Bootstrap Loader Program
- 해당하는 운영체제(OS) 커널 파일을 디스크에서 load하여 실행


<br>

### 4) Disk Scheduling Alogrithm

<br>

#### a. FCFS (First Come First Served)

- 비효율적임


<br>

#### b. SSTF (Shorthest Seek Time First)

- 헤드의 위치에서 가까운 요청 순으로 처리

- Starvation 문제가 발생할 수 있음 → 큐에 계속 가까운 거리가 들어온다면 먼 요청은 계속 처리되지 않을 수 있음

<br>

#### c. SCAN

- 엘리베이터 스케쥴링 이라고도 부름

<br>

#### d. C-SCAN

- 헤드가 한쪽 끝에서 다른쪽 끝으로 이동하며 가는 길목에 있는 모든 요청을 처리한다. SCAN 대비 이동거리는 좀 더 길어질 수 있지만, 균일한 대기시간을 제공할 수 있다.


 
<br>

### 5) 기타 알고리즘

<br>

#### a. N-SCAN
- SCAN의 변형 알고리즘
- 일단 arm이 한 방향으로 움직이기 시작하면 그 시점 이후에 도착한 job은 되돌아올 때 service


<br>

#### b. LOOK and C-LOOK
- SCAN이나 C-SCAN은 헤드가 디스크 끝에서 끝으로 이동
- LOOK과 C-LOOK은 헤드가 진행 중이다가 그 방향에 더 이상 기다리는 요청이 없으면 헤드의 이동방향을 즉시 반대로 이동한다

<br>

### 6) Disk Scheduling Alogrithm의 결정
- SCAN, C-SCAN 및 그 응용 알고리즘은 LOOK, C-LOOK 등이 일반적으로 디스크 입출력이 많은 시스템에서 효율적인 것으로 알려져 있음
- File의 할당 방법에 따라 디스크 요청이 영향을 받음(연속할당을 했으면, 연속된 실린더 위치에 있어서 이동거리를 줄일 수 있는 등)
- 디스크 스케줄링 알고리즘은 필요할 경우 다른 알고리즘으로 쉽게 교체할 수 있도록 OS와 별도의 모듈로 작성되는 것이 바람직하다.

<br>

### 7) Swap-Space Management
- Disk를 사용하는 두가지 이유
- 메모리의 volatile한(휘발성) 특성 → file system
- 프로그램 실행을 위한 memory 공간 부족 → swap sapce(swap area)

<br>
- Swap Area
- Virtual memory system에서는 디스크를 memory의 연장공간으로 사용
- 파일 시스템 내부에 둘 수도 있으나 별도 partition 사용이 일반적
- 공간 효율성 보다는 속도 효율성이 우선
- 일반 파일보다 훨씬 짧은 시간만 존재하고 자주 참조됨
- 따라서 block의 크기 및 저장방식이 일반 파일시스템과 다름(예를들어, 밑의 그림처럼 일반은 512바이트, 스왑에어리어는 512 킬로바이트)

<br>

### 8) RAID(Redundant Array of Independent Disks)
- 여러개의 디스크를 묶어서 사용

<br>
- 사용 목적

- 디스크 처리 속도 향상
- 여러 디스크에 block의 내용을 분산 저장
- 병렬적으로 읽어 옴(interleaving, striping 기법)
- 신뢰성(reliability) 향상
- 동일 정보를 여러 디스크에 중복 저장
- 하나의 디스크가 고장(failure) 시 다른 디스크에서 읽어옴(Mirroring, shadowing)
- 단순한 중복저장이 아니라 일부 디스크에 parity(중복저장의 정도를 좀 낮추는 기법)를 저장하여 공간의 효율성을 높일 수 있다

