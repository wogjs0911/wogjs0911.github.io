---
key: /2022/12/26/Daily-Test(22-12-final).html
title: Test-Daily Test(22-12-마지막주)
tags: java
---

# 1. [22.12.26] : 지하철 시스템 코드 최종 수정

```java
package com.test.service;

import java.util.Scanner;

// **** 문제점1 : 새로운 목적지를 선택하면 그 목적지가 현재역으로 위치가 바뀜. ****** : [해결] - 약간의 로직 필요하며 현재역 출력 부분과 목적지 List 출력 부분을 따로 객체 변수로 getter, setter로 구현함 
// **** 문제점2 : 이동하고 나서 목적지 List이 고정된 형태이다.			****** : [해결] -
// **** 문제점3 : 탑승 시, 스택처럼 쌓이지 않고 자리를 지정해서 앉는 느낌이다. - 해결하지 못하면, 승객 중에서 같은 목적지에서 내리는 승객을 처리할 수 없다!!(중복 처리)
// **** 문제점4 : 탑승 시, 현재역에서 현재역에 다시 탑승하면 다시 입력해달라고 할 것. 탑승하자마자 내려야하므로 (나중에 고치기) ****** : [해결하기] - do while 이용할 것
// **** 문제점 5 : 오입력 시, 다시 입력해야함.						 ****** : [해결하기] - do while 이용할 것

public class SubwayService {
	
	boolean ox = true;
	
	String[] subwaySections = {"1호차","2호차","3호차","4호차"};
	String[] destinations = {"합정역","홍대입구역","신촌역","이대역","아현역"};
	
	Section[] sections = new Section[4];				// 객체 지향으로 배열을 연결하기 위한 객체 배열 생성
	Station[] stations = new Station[5];
	Passenger[][] passengers = new Passenger[4][5];
	
	int[] passengerCount = new int[4];					// 각 지하철역마다 사람수 count 변수 선언
	int[] statonCount = new int[5];						
	
	int[] currentStationList = new int[5];				// 현재역 표시 인덱스		
	int[] nextStationList = new int[5];					// 목적지 업데이트 후 현재역 표시 인덱스
	
	
	int stationNum = 0;				// 상세 부분의 2차원 배열 인덱스
	int sectionNum = 1;				// 상세 부분의 2차원 배열 인덱스
	
	int	currentStream = -1;			// 초기 목적지 List 인덱스	
	int nextStream = -1;			// 목적지 선택 후 목적지 List 인덱스				
	
	
	public void run() {
		
		for (int i = 0; i < 4; i++) 					// 객체 배열 할당을 가장 처음에 해줘야지  while문 돌때마다 switch문 실행 시, 초기화가 되지 않는다. 
			sections[i] = new Section();				// 중요!! sections[i] 객체 배열 생성 이렇게 앞에 생성해서 뒤에서 여러번 사용한다. 배열 할당이면서 초기화 느낌
		
		for (int i = 0; i < 5; i++)  					// 객체 배열 할당을 가장 처음에 해줘야지  while문 돌때마다 switch문 실행 시, 초기화가 되지 않는다. 
			stations[i] = new Station();				// 중요!! stations[i] 객체 배열 생성 이렇게 앞에 생성해서 뒤에서 여러번 사용한다. 배열 할당이면서 초기화 느낌
		
		for (int j = 0; j < 4; j++)  
			for (int i = 0; i < 5; i++)  
				passengers[j][i] = new Passenger();
		
		
		Flag :
		while(ox) {
			
			System.out.println("=================================");
			
			if(stations[0].getMoveCheck() == false)
				System.out.println("현재역은 " + stations[0].getCurrentStation() + "입니다."); // 1-1) 초기값 설정으로 해결
			else
				System.out.println("현재역은 " + stations[0].getNextStation() + "입니다."); // 1-2) 추가 설정으로 해결
			
			System.out.println("=================================");
			
			System.out.println("메뉴를 선택해주세요.");
			System.out.println("1. 탑승 // 2. 상세 보기 // 3. 이동 // 9. 종료");
			Scanner scan = new Scanner(System.in);
			
			switch (scan.nextLine()) {
	
			case "1":
				join();
				break;
	
			case "2":
				status();
				break;
	
			case "3":
				move();
				break;
	
			case "9":
				System.out.println("열차운행을 종료합니다.");
				break Flag;
	
			default:
				System.out.println("잘못 입력하셨습니다.");
	
			}
		
		}	
	}

	private void join() {
		
		Scanner scan = new Scanner(System.in);

		System.out.println("------- 탑승가능 현황 -------");


		
		for (int i = 0; i < 4; i++) { 
			
			if (sections[i].getSectionCount() < 4) {
				System.out.println((i+1) + "호차 : 가능");
			}
			else if (sections[i].getSectionCount() == 4) {
				System.out.println((i+1) + "호차 : 불가능");
			}
			
			if (sections[0].getSectionCount() == 4 && sections[1].getSectionCount() == 4 
					&& sections[2].getSectionCount() == 4 && sections[3].getSectionCount() == 4) {
				System.out.println("더이상 탑승 가능열차가 없습니다.");
			}
		}
		
		
		// ---------------- 열차 [section] ---------------------------------------------------------
		
		System.out.println("어느 열차에 탑승하시겠습니까?");
		
		for(int i =0; i<4; i++) {						// 처음 열차 차량 설정
			
			sections[i].setSectionNum(i+1);
			sections[i].setSectionName(subwaySections[i]);	
		}
		
														// 추가하기!! :  다음역을 반영하여 목적지 순서 나열 업데이트 출력 부분
		for(int i =0; i<4; i++) {						// 열차 차량 목록 출력
			sections[i].print();
		}
		System.out.println();
		
		
		
		sectionNum = Integer.parseInt(scan.nextLine());					// 타고 싶은 열차 차량  입력

		for(int i = 0 ; i <5; i++) {
			
			stations[i].setJoinCheck(true);			// "탑승" 먼저 누르고 "이동" 누른 것을 체킹하기 위해서 *********
													// (중요!! 배열 개수도 생각!! move메서드의 join 체킹을 위한 배열 개수 생각!)
			
			if (i == sectionNum-1) {							
				sections[i].setSectionCount(++passengerCount[i]);			// 타고 싶은 열차 차량의 사람수 count
				sections[i].setSectionName(subwaySections[sectionNum-1]);		// 타고 싶은 열차 차량 setting		
				
				System.out.println(sections[i].getSectionName());
				
			}
					
		}
		
		
		
		
		// ---------------- 목적지 [station] ---------------------------------------------------------
		// ** 에러 해결!! : 현재역 표시하는 메서드와 목적지를 표시하는 메서드를 따로 각각 구별해서 만들어줘야지 충돌하지 않는다!!!!
		
		System.out.println("목적지를 선택해주세요.");
		
		// 2-1) 첫 목적지 List 부분***** (목적지 List는 현재역을 빼고 나머지를 표시하므로 인덱스를 0~3까지만 출력 _ 원래는 5개여야하는데)
		
		currentStream = 0;
		
		for(int i =0; i<4; i++) {										// 목적지 List 나열
			
			
			if (destinations[i] == stations[0].getCurrentStation()) 	// 다음역 == 객체 배열 index
				currentStream = i;	
			
			stations[i].setStationNum(currentStream+2);
			stations[i].setStationName(destinations[++currentStream]);
			
			if(currentStream == 4) 
				currentStream = -1;	
		}
		
		// 2-2) 목적지 이동 후 목적지 List 부분***** (목적지 List는 현재역을 빼고 나머지를 표시하므로 인덱스를 0~3까지만 출력 _ 원래는 5개여야하는데)
		
		
		for(int i =0; i<4; i++) {									// 목적지 List 나열
			if(stations[i].getMoveCheck() == true) {
				
				if (destinations[i] == stations[0].getNextStation())  	// 다음역 == 객체 배열 index
					nextStream = i;	
				
				stations[i].setNextStationNum(nextStream+2);
				stations[i].setNextStationName(destinations[++nextStream]);
				
				if(nextStream == 4) 
					nextStream = -1;
				
			}
		}
		
		
		// ** 목적지 List는 현재역을 빼고 나머지를 표시하므로 인덱스를 0~3까지만 출력 _ 원래는 5개여야하는데)
		for(int i =0; i<4; i++) {
			 										// move()가 동작 안 했으면 그대로 currentPrint가 동작하게 

			if(stations[i].getMoveCheck() == false) {
				stations[i].currentListPrint();
			}
			else if(stations[i].getMoveCheck() == true) {
				stations[i].nextListPrint();
			}
			
			
				
		}
		System.out.println();
		
		
		// ------ [상세내용 부분에서 쓸 내용] ------
		
		stationNum = Integer.parseInt(scan.nextLine());			// 목적지 입력
		
		for(int i =0; i<5; i++) {								// 목적지 데이터 저장 -> 나중에 "상세내용" 부분에서 사용
			if (i == stationNum-1) {
				stations[i].setStationNum(stationNum);							// 가고싶은 목적지 Num 세팅. 또한, 2차원 배열을 위한 칼럼 num 저장(나중의 "상세" 부분을 위해)
				stations[i].setStationName(destinations[stationNum-1]);			// 가고싶은 목적지 Name 세팅. 
				
				System.out.println(stations[i].getStationName());
			}
		}
		
		for(int j =0; j<4; j++) {									// 2차원 객체 배열의 각 요소 초기화 및 설정
																	// ** 지금 문제점 : 탑승하고 상세내역을 눌러야지 출력이 되고
			for(int i =0; i<5; i++) { 								// 탑승을 바로 여러번하고 나서 상세내역을 뒤늦게 누르면 마지막 것만 출력이 된다.
				
				if (i == stationNum-1 && j == sectionNum-1)			// 전역 변수 주의!! 선언하면 초기화 되어서..
					passengers[j][i].setpassengerRide(stations[i].getStationName());
			}
		}
		
		

	}

	private void move() {						
	
		// 1-1) 목적지 이동 후 현재역 출력을 위한 입력 부분  *****
		for(int i =0; i<5; i++) {									// 목적지 List 나열

			stations[i].setMoveCheck(true);
			
			if (destinations[i] == stations[0].getNextStation()) 	// 다음역 == 객체 배열 index
				nextStationList[i] = i;		
			
			if(nextStationList[i] == 4)
				nextStationList[i] = -1;
			
			stations[i].setNextStation(destinations[++nextStationList[i]]);
		
			
			
			
		}
		
		// 1-2) 탑승을 먼저 눌렀을 경우,현재역 출력을 위한 입력부분
		for(int i =0; i<5; i++) {									// 목적지 List 나열
			stations[i].setMoveCheck(true);
			
			if(stations[i].getJoinCheck() == true) {

				if (destinations[i] == stations[0].getNextStation()) { 	// 다음역 == 객체 배열 index
					nextStationList[i] = i;		
					
				if(nextStationList[i] == 4)
					nextStationList[i] = -1;
				
				stations[i].setNextStation(destinations[++nextStationList[i]]);
				
				
				}
			}
		}
		
		
		// 3) 지하철역 하차 로직 
		int dropCount = 0;

		for(int j =0; j<4; j++) {									// 2차원 객체 배열의 각 요소 초기화 및 설정
																	// ** 지금 문제점 : 탑승하고 상세내역을 눌러야지 출력이 되고
			for(int i =0; i<5; i++) { 								// 탑승을 바로 여러번하고 나서 상세내역을 뒤늦게 누르면 마지막 것만 출력이 된다.
			
				if(stations[0].getNextStation() == "합정역" && passengers[j][i].getpassengerRide() == "합정역") {
					passengers[j][i].setpassengerRide("없음");
					dropCount++;
				}
				
				else if(stations[0].getNextStation() == "홍대입구역" && passengers[j][i].getpassengerRide() == "홍대입구역") {
					passengers[j][i].setpassengerRide("없음");
					dropCount++;
				}
				else if(stations[0].getNextStation() == "신촌역" && passengers[j][i].getpassengerRide() == "신촌역") {
					passengers[j][i].setpassengerRide("없음");
					dropCount++;
				}
				else if(stations[0].getNextStation() == "이대역" && passengers[j][i].getpassengerRide() == "이대역") {
					passengers[j][i].setpassengerRide("없음");
					dropCount++;
				}
				else if(stations[0].getNextStation() == "아현역" && passengers[j][i].getpassengerRide() == "아현역") {
					passengers[j][i].setpassengerRide("없음");
					dropCount++;
				}
			}
		}
		
		System.out.printf("%d명이 하차했습니다.", dropCount);
		
		System.out.println();
		System.out.println("현재역은 " + stations[0].getNextStation() + "입니다.");
	}

	private void status() {

		
		// 4) 상세 내용을 보기 위한 로직

		for(int j =0; j<4; j++) {							// 2차원 객체 배열의 각 요소 초기화 및 설정
		
			for(int i =0; i<5; i++) { 

				if (i == 0) 
					System.out.printf("%d호차 : [%s] ", j+1, passengers[j][i].getpassengerRide());
				else
					System.out.printf("[%s] ", passengers[j][i].getpassengerRide());						
			}
			System.out.println();
		}

	}
}
```

