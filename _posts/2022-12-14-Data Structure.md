---
key: /2022/12/14/Data-Structure.html
title: 자료구조-자료구조 정리
tags: TeXt algorithm

---
(https://st-lab.tistory.com/) 참고!!


<br>
# 0. Java Collections

- 선형 자료구조(Linear Data Structure)과 비선형 자료구조(Nonlinear Data Structure)

	- 선형 자료구조(Linear Data Structure) : 데이터가 일렬로 연결된 형태. int[] 배열같은 것이다. 선형 자료구조는 리스트(List)와 큐(Queue), 덱(Deque)가 있다.

	- 비선형 자료구조(Nonlinear Data Structure) : 일렬로 나열된 것이 아닌, 각 요소가 여러 개의 요소와 연결 된 형태이다. 비선형 자료구조는 그래프(Graph)와 트리(Tree)가 있다.

- List Interface를 구현하는 클래스

	- ArrayList

	- LinkedList

	- Vector (+ Vector를 상속받은 Stack)


---
<br><br> 
# 1. List Interface

<br> 
### 1) [공통점] : 배열과 리스트
- 동일한 특성의 데이터들을 묶는다.

- 반복문(loop)내에 변수를 이용하여 하나의 묶음 데이터들을 모두 접근할 수 있다.

 
<br> 
### 2-1) [차이점 - 배열]
- 처음 선언한 배열의 크기(길이)는 변경할 수 없다. 이를 정적 할당(static allocation)이라고 한다.

- 메모리에 연속적으로 나열되어 할당된다.

- index에 위치한 하나의 데이터(element)를 삭제하더라도 해당 index에는 빈공간으로 계속 남는다. 



<br> 
### 2-2) [차이점 - 리스트]

- 리스트의 길이가 가변적이다. 이를 동적 할당(dynamic allocation)이라고 한다.

- 데이터들이 연속적으로 나열된다. (메모리에 연속적으로 나열되지 않고 각 데이터들은 주소(reference)로 연결되어있다. C에서의 포인터라고 생각하면 된다.)

- 데이터(element) 사이에 빈 공간을 허용하지 않는다.


<br> 
### 3-1) [배열의 장단점]

>장점

- 데이터 크기가 정해져있을 경우 메모리 관리가 편하다.

- 메모리에 연속적으로 나열되어 할당하기 때문에 index를 통한 색인(접근)속도가 빠르다.

 

>단점

- 배열의 크기를 변경할 수 없기 때문에 초기에 너무 큰 크기로 설정해주었을 경우 메모리 낭비가 심해지고, 반대로 너무 작은 크기로 설정해주었을 경우 데이터를 다 못담을 수 있는 경우가 발생 할 수 있다.

- 빈 공간을 허용하지 않고 데이터를 삽입(add), 삭제(remove)를 하고자 한다면, 뒤의 데이터들을 모두 밀어내거나 당여주어야 하기 때문에 속도가 느려 삽입, 삭제가 빈번한 경우에는 유용하지 않다.

 

<br> 
### 3-2) [리스트의 장단점]

 
>장점

- 데이터의 개수에 따라 해당 개수만큼 메모리를 동적 할당해주기 때문에 메모리 관리가 편리해진다.

- 빈 공간을 허용하지 않기 때문에 데이터 관리에도 편하다.

- 포인터(주소)로 각 데이터들이 연결되어 있기 때문에 해당 데이터에 연결된 주소만 바꿔주면 되기 때문에 삽입 삭제에 용이하다.(ArrayList는 예외)

 
>단점

- 객체로 데이터를 다루기 때문에 적은양의 데이터만 쓸 경우 배열에 비해 차지하는 메모리가 커진다.

간단히 예로들어 primitive type인 Int는 4Byte를 차지한다. 반면에 Wraaper class인 Integer는 32bit JVM에선 객체의 헤더(8Byte), 원시 필드(4Byte), 패딩(4Byte)으로 '최소 16Byte를 차지한다. 거기에다가 이러한 객체데이터들을 다시 주소로 연결하기 때문에 16 + α 가 된다.

- 기본적으로 주소를 기반으로 구성되어있고 메모리에 순차적으로 할당하는 것이 아니기 때문에(물리적 주소가 순차적이지 않다) 색인(검색)능력은 떨어진다.

---

<br> # 2. ArrayList


---

<br><br>
# 3. Java Generic(제너릭)

<br>[Generic(제네릭)의 장점]
- 제네릭을 사용하면 잘못된 타입이 들어올 수 있는 것을 컴파일 단계에서 방지할 수 있다.
- 클래스 외부에서 타입을 지정해주기 때문에 따로 타입을 체크하고 변환해줄 필요가 없다. 즉, 관리하기가 편하다.
- 비슷한 기능을 지원하는 경우 코드의 재사용성이 높아진다.


<br>[public class ClassName <E extends Comparable<? super E>> { ... } ]
- 이렇게도 사용 가능하며 super로서 상속받아서 Comparable은 무조건 사용된다.
- 에러 발생 방지를 위해서 이렇게 사용된다. 제너릭, Comparable 이용

---

<br><br>
# 4. Java Comparable 과 Comparator의 이해 

- 객체 비교할 때, 무조건 사용되는 방식이다.(중요!!)

<br>[Java Comparable]
- compareTo로 무조건 구현되어야 한다.
- 자기 자신의 객체와 다른 객체를 비교한다. 
- Comparable은 compareTo 메서드 하나만 생성 가능하다. 추가적으로 비교하고 싶을 때는 Comparator를 이용한다.
- Underflow, OverFlow 주의

<br>[Java Comparator] :
- compare로  구현되어야 하고 자기 자신의 객체가 아니라 서로 다른 객체를 비교할 때, 이용한다. 
- 여러 개의 객체를 비교하고 싶을 때, compare로 메서드를 여러개로 구현할 수 있다.
- Comparator는 파라미터로 넘겨주는 방법도 있다.
- Underflow, OverFlow 주의

- 정리 : 기본적으로는 Comparable로 구현하고 추가적인 기능을 넣을 때는 Comparator를 이용한다.

---

<br><br>
# 5. Singly LinkedList(단일 연결리스트)

- 처음에 prev_Node와 next_Node를 지정했기 때문에 next_Node는 prev_Node.next로 찾을 수 있다.


<br>[sort() 메소드] 
- 단일 연결리스트의 sort()에서 Comparator를 사용하여 객체 정렬을 할 수 있다.(비교)

- 첫 번째는 객체에 Comparable이 구현되어 있어 따로 파라미터로 Comparator를 넘겨주지 않는 경우고
- 다른 하나는 Comparator을 넘겨주어 정의 된 정렬 방식을 사용하는 경우다.



<br> [Singly LinkedList 정리]
- Singly LinkedList는 왠만해선 head만 고려해서 생각한다.

- 단일 연결리스트의 경우 삽입, 삭제 과정에서 '링크'만 끊어주면 되기 때문에 매우 효율적이라는 것을 볼 수가 있을 것이다.

- 반대로 모든 자료를 인덱스가 아닌 head부터 연결되어 관리하기 때문에 색인(access)능력은 떨어진다. 결과적으로 이전에 구현했던 ArrayList와 이번에 구현한 LinkedList의 쓰이는 용도가 다르다는 것을 알 수가 있다.

- 쉽게 생각해서 '삽입, 삭제'가 빈번한 경우 LinkedList를 쓰는 것이 좋고, 데이터 접근이 주를 이룰 경우 ArrayList가 좋다

- 양방향의 경우 고려해야 할 것이 워낙 많고, 기본적인 구조 이해 없이는 어렵기 때문이다.


---

<br><br>
# 6. Doubly LinkedList (이중 연결리스트)

<br> [Doubly LinkedList 정리]

- Doubly LinkedList는 Singly LinkedList와 다르게 head뿐만 아니라 tail까지 고려해주어야 한다. 즉, 2가지를 고려야해야 한다.

- add(int index, E value) 메서드 : 
	- 이전노드(prev_Node)의 next 변수는 새 노드(newNode)를 가리키도록 하고, 새 노드는 prev와 next를 앞 뒤 노드를 가리키도록 한 뒤, 마지막으로 next_Node의 prev 변수는 새 노드를 가리키도록 해야한다. 또한 index 변수가 잘못된 위치를 참조할 수 있으니 이에 대한 예외처리로 IndexOutOfBoundsException을 한다.
	
	
	- 정리하면, 이전노드의 입장, 새노드의 입장, 다음 노드의 입장에서 총 3번의 위치에서 입장 고려해야 한다.

- remove(int index) 메소드 :
	- '삭제하려는 노드의 이전 노드'의 next 변수를 '삭제하려는 노드의 다음 노드'를 가리키도록 해주면 된다.
	
	
	- 즉, 여기도 이전노드의 입장, 새노드의 입장, 다음 노드의 입장에서 총 3번의 위치에서 입장 고려해야 한다.
	
	
---





