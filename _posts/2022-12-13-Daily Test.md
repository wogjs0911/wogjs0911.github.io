---
title: Daily Test
tags: java
---

#1. [22.12.13]

```java
package day.test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;


public class test_221213_1_2 {

	public static void main(String[] args) throws IOException {
		

		/*
		 * res/data.txt 파일에 다음처럼 빈 공백으로 구분 된 값들이 있다.
		 * 
		 * 20 30 29 39 49 38 10 19 87 29 38 27 8 90 87
		 * 
		 * 문제 1 : 이 값들의 개수를 구하는 코드를 작성하시오. 
		 * int count = 0; { // 코드를 작성하는 공간
		 * 
		 * 
		 * } Sysout.out.printf(“count is %d\n”, count);
		 */
		
		int count = 0;
		
		{
			FileInputStream fis = new FileInputStream("res/data.txt");
			Scanner scan = new Scanner(fis);
			 // "20 30 29 39 49 38 10 19 87 29 38 27 8 90 87 "
			
			while(scan.hasNext()) {											// 정답
				int temp = scan.nextInt();
				count++;
			}
			
			fis.close();		
		}
		
		System.out.printf("count is %d\n", count);
		
		
		/*문제 2 : 이 값들 중에서 가장 큰 값이 무엇인지 출력하는 코드를 작성하시오.

		int max = -1;
		{
		    // 코드를 작성하는 공간

		}
		Sysout.out.printf(“max is %d\n”, max);*/
		
		int max = -1;
		
		{
			FileInputStream fis = new FileInputStream("res/data.txt");
			Scanner scan = new Scanner(fis);	 // "20 30 29 39 49 38 10 19 87 29 38 27 8 90 87 "
		
			while(scan.hasNext()) {
				int temp = scan.nextInt();
				
				if(temp > max)
					max = temp;
			}	
			
			fis.close();
			
		}		
		System.out.printf("max is %d\n", max);
		
		
		/*문제 3 : 이 값들 중에 10 을 찾아서 그 위치(인덱스 값)을 출력하시오.
		int index = -1;
		{
		    // 코드를 작성하는 공간



		}
		System.out.printf(“index is %d\n”, index);*/
		
		int index = -1;
		
		{
			FileInputStream fis = new FileInputStream("res/data.txt");
			Scanner scan = new Scanner(fis);	 // "20 30 29 39 49 38 10 19 87 29 38 27 8 90 87 "
			int i = 0;
			
			while(scan.hasNext()) {
				
				int temp = scan.nextInt();
				
				index++; 						// i++;
				
				if(temp == 10)
					break; 						// index = i;
			}	
			fis.close();			
		}		
		System.out.printf("index is %d\n", index);
		
	}

}

```



<br><br>
#2. [22.12.14]

```java
package day.test;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Random;
import java.util.Scanner;

	
public class test_221214_1_1 {																		// 코드는 단계별로 주석처리로 진행했다.

	public static void main(String[] args) throws IOException {
		
		/*
		 * —----------------------------------------------------------------------------
		 * ---------------------------------- : 제어구조 + 배열
		 * —----------------------------------------------------------------------------
		 * ----------------------------------
		 * 
		 * 문제 4 : 다음 각 절차를 따라 작성하시오.
		 * 
		 * // 1. nums라는 이름으로 정수 15개를 저장할 수 있는 배열 객체를 생성한다. int nums =
		 * 
		 * // 2. res/data.txt 파일에 저장된 값들을 nums 배열에 로드한다. { // 코드를 작성하는 공간
		 * 
		 * 
		 * System.out.println(“로드 완료”); }
		 * 
		 * // 3. 0~14 범위의 랜덤값 2개를 얻어서 그 위치의 값을 서로 바꾼다. 그것을 50번 반복한다. { // 코드를 작성하는 공간
		 * 
		 * 
		 * System.out.println(“번호 섞기 완료”); }
		 * 
		 * // 4. res/data-out.txt 파일로 배열의 값들을 저장 { // 코드를 작성하는 공간
		 * 
		 * 
		 * 
		 * System.out.println(“저장 완료”); }
		 */
		
		int[] nums = new int[15];
		
		{
			FileInputStream fis = new FileInputStream("res/data.txt");				// (" ")이라는 파일과 연결된 FileInputStream을 "fis"라는 참조변수(연결 통로)로 만들어서 사용할 것이다.
			Scanner scan = new Scanner(fis);			// Scanner는 문자열을 통으로 받기 위해 사용하며, fis라는 연결통로에  scan이라는 버퍼를 만든다.
			
			for(int i=0; i<15; i++)
				nums[i]= scan.nextInt();
			
			System.out.println("로드 완료");
			fis.close();                              // 닫아주는 것 주의!
		}
		
		{
			Random rand = new Random();
			
			for(int i=0; i<50; i++) {							// random 난수의 반복 위치 생각(프로그래밍 동작 이해)
				
				int s = rand.nextInt(15);
				int d = rand.nextInt(15);	
				
				int temp = nums[s];
				nums[s] = nums[d];
				nums[d]= temp;
			}
			
			
			System.out.println("번호 섞기 완료");

		}
		
		{
			FileOutputStream fos = new FileOutputStream("res/data-out.txt");			// (" ")이라는 파일 이름과 연결된 FileOutputStream을 "fos"라는 참조변수로 만들어서 사용할 것이다.
			PrintStream out = new PrintStream(fos);			// Scanner와 같이 PrintStream도 문자열을 통으로 받기 위해 사용하며, fos라는 연결통로에  out이라는 버퍼를 만든다.
																			// 스트림은 연결통로이고 버퍼는 임시 저장공간(박스)이다.	 				
																			// FileOutputStream fos는 문자를, PrintStream out은 문자열을 사용
			
			for(int i=0; i<15; i++) {
				out.printf("%d", nums[i]);
				if(i!=14)
					out.print(",");
			}
				System.out.println("저장 완료");		// 20,30,29,39,49,38,10,19,87,29,38,27,8,90,87
				
			fos.close();										   // 닫아주는 것 주의!
		}
}
}


```

<br><br>
#3. 오목게임 수정[22.12.14]

```java
package ex1.test;

import java.util.Scanner;

public class OmokTest3 {

	public static void main(String[] args) {
		
		// 오목에서 배열 10x10 100개 문자를 담을 수 있는 배열 이름: board
		char[] board = new char[100];
		char[][] board2 = new char[10][10];

		//----------- board1 -------------------

		for(int i=0; i<100; i++)
			board[i] = '┼'; 
		
//		board[15] ='○';							// 배열은 기존의 정수값과는 다르다.
//		//board[44] ='○';	
//		board[(5-1)*10+(6-1)] ='○';	
		

		
//		for(int i=0; i<100; i++) {
//			
//			System.out.print(board[i]);
//			
//			if(i % 10 ==9) 	
//				System.out.print("\n");
//			
//		}
		
		
		
	//----------- board2 -------------------
		
		for(int y=1; y<=10; y++) {
			for(int x =1; x<=10; x++) {
				board2[y-1][x-1] = '┼';		
			}
		}
		
		for(int y=1; y<=10; y++) {
			for(int x =1; x<=10; x++) {
				board2[0][x-1] = '┬';
				board2[9][x-1] = '┴';
			}
			board2[y-1][0] = '├';
			board2[y-1][9] = '┤';
			
			board2[0][0] = '┌';
			board2[0][9] = '┐';
			board2[9][0] = '└';
			board2[9][9] = '┘';
		}
	
		for(int y=1; y<=10; y++) {
			for(int x =1; x<=10; x++) {
				System.out.printf("%c", board2[y-1][x-1]);
			}
			System.out.print("\n");
		}
		
		
		//----------- omok game -------------------
		
		Scanner scan = new Scanner(System.in);										// while문의 조건 처리는 변수화하여 최대한 적게 해야한다.
		int ox, oy;
		
		for(int count =100; count>0; count--) {												// 중첩이 최대한 적게 만들어야 한다.
			
			System.out.println("(x, y) > ");
		
			ox = scan.nextInt();
			oy = scan.nextInt();
				
			if(ox<1 || ox>10 || oy<1 || oy>10)	{											// 예외 처리 추가 (같은 위치에 오목돌 겹치지 않게 하기)
				System.out.println("x는 1~10의 수만 입력할 수 있습니다. x: ");
				System.out.println("y는 1~10의 수만 입력할 수 있습니다. y: ");
				continue;
			}
		
			if(count % 2 == 0) 
				board2[ox-1][oy-1] = '○';
			else 
				board2[ox-1][oy-1] = '●';
			
			if(count<100) {
				if(board2[ox-1][oy-1] == '○'  || board2[ox-1][oy-1] == '●') {
					System.out.println("돌이 있습니다. ");
					continue;
				}
			}
			
			for(int y=1; y<=10; y++) {
				for(int x =1; x<=10; x++) {
					System.out.printf("%c", board2[y-1][x-1]);
				}
				System.out.print("\n");
			}	
		}
		
//			//-------------------------------------	---------------	---------------	---------------	
//			 <원래>
			
//			if(count % 2 == 0) 
//				board2[ox-1][oy-1] = '○';
//			else
//				board2[ox-1][oy-1] = '●';
//			
//			
			
			
		}
	}
								// 자리 배치하기
								// 랜덤하게 섞어서 추가 조건 처리 :  누구랑 누구랑 묶여서?
								// UI 이쁘게


```

<br><br>
#3. [22.12.15] : 문제 5

```java
package day.test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Scanner;

	
public class test_221215_1_1 {																		// 코드는 단계별로 주석처리로 진행했다.

	public static void main(String[] args) throws IOException  {
		
		/*
		 * //문제 5 : 다음 각 절차를 따라 작성하시오.
		 * 
		 * 
		 * // 1. res/alphabet.txt 파일을 생성하고 다음 데이터를 복사/붙여넣으시오. // abcdefghijklmn
		 * 
		 * // 2. alphabet이라는 이름으로 문자 15개를 저장할 수 있는 배열 객체를 생성한다. [ ] alphabet = [ ];
		 * 
		 * // 3. res/alphabet.txt 파일에 저장된 구분자가 없는 영문자 값들을 alphabet 배열에 로드한다. { // 코드를
		 * 작성하는 공간
		 * 
		 * 
		 * System.out.println(“로드 완료”); }
		 * 
		 * // 3. 배열의 값이 다음과 같은 상태가 되도록 자리를 바꾼다. // nmlkjihgfedcba
		 * 
		 * { // 코드를 작성하는 공간
		 * 
		 * 
		 * 
		 * System.out.println(“자리변경 완료”); }
		 * 
		 * // 4. res/alphabet-out.txt 파일로 배열의 값들을 저장 { // 코드를 작성하는 공간
		 * 
		 * 
		 * 
		 * System.out.println(“저장 완료”); }
		 */
		
		
		// 1. res/alphabet.txt 파일을 생성하고 다음 데이터를 복사/붙여넣으시오. // abcdefghijklmn
		char[] alphabet = new char[15];
		
		
		 // 2. alphabet이라는 이름으로 문자 15개를 저장할 수 있는 배열 객체를 생성한다. [ ] alphabet = [ ];
		{
			FileInputStream fis = new FileInputStream("res/alphabet.txt");
			Scanner scan = new Scanner(fis);
			String line = scan.nextLine();
			System.out.printf("%s\n",line); 
			
			for(int i = 0; i<14; i++) {													// for-each 구문도 생각!!
				alphabet[i] = line.charAt(i);
				System.out.printf("%c",alphabet[i]); 
			}
			System.out.println(); 
			System.out.println("로드 완료"); 
		}
		
		
		 // 3. 배열의 값이 다음과 같은 상태가 되도록 자리를 바꾼다. // nmlkjihgfedcba
		{
			char temp;																	// 다른 방식 :
			for(int j=0; j<15-1; j++) {												// 1.  : 배열 교차,
																							// 2. 문자열 바꿔주는 방법 : fis.read는 문자열을 int로 반환, toCharArray라는 메서드 사용
			for(int i=0; i<15-1-j; i++) {
				if(alphabet[i+1]>alphabet[i]) {									// "-1"은 배열이 i와 i+1이라서 이렇게 설계했다. 생각해보기(숫자 대입)
					temp = alphabet[i];												// "-j"는 비교되는 값을  한곳으로 몰아 넣고 나머지를 다시 정렬한다.
					alphabet[i] =  alphabet[i+1];
					alphabet[i+1] = temp;
				}
			}
			
			}
			for(int i=0; i<15-1; i++) {
				System.out.printf("%c",alphabet[i]); 
			}
			System.out.println("\n자리변경 완료"); 
			
		}
			
		 // 4. res/alphabet-out.txt 파일로 배열의 값들을 저장 { // 코드를 작성하는 공간
		
		{
			FileOutputStream fos = new FileOutputStream("res/alphabet.txt");
			PrintStream out = new PrintStream(fos);
			
			for(int i=0; i<15; i++) {
				out.printf("%c", alphabet[i]);
			}
				
			fos.close();
			//fos.wr
			System.out.println("\n저장 완료");
		}
		
		}
}

``` 


<br><br>
#3-1. [22.12.15] : 문제 6

```java
package day.test;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Scanner;

/*—--------------------------------------------------------------------------------------------------------------
:  제어구조 중첩 + 다차원 배열
—--------------------------------------------------------------------------------------------------------------

문제 6 : 다음 각 절차를 따라 작성하시오.

// 1. res/bitmap.txt 파일을 생성하고 다음 데이터를 복사/붙여넣으시오.

11111111110000000000
11111111100000000000
11111111000000000000
11111110000000000000
11111100000000000000
11111000000000000000
11110000000000000000
11100000000000000000
11000000000000000000
10000000000000000000


2. bitmap이라는 이름으로 20X10크기의 정수를 담을 수 있는 이차원 배열을 생성하시오.

[           ]  bitmap = [                                      ];

3. 다음 그림과 같은 모양이 되도록 값의 위치를 변경하시오
00000000001111111111
00000000000111111111
00000000000011111111
00000000000001111111
00000000000000111111
00000000000000011111
00000000000000001111
00000000000000000111
00000000000000000011
00000000000000000001

{
     // 코드를 작성하는 공간



    System.out.println(“자리변경 완료”);
}


// 4. res/bitmap-out.txt 파일로 bitmap 배열의 값들을 저장 
{
     // 코드를 작성하는 공간

    

    System.out.println(“저장 완료”);
}
*/
	
public class test_221215_1_2 {																		// 코드는 단계별로 주석처리로 진행했다.

	public static void main(String[] args) throws IOException  {
		
		int[][] bitmap = new int[20][10];
		String[] nums = new String[10];
		char[] num = new char[20];
		
	
		{
			FileInputStream fis = new FileInputStream("res/bitmap.txt");
			Scanner scan = new Scanner(fis);
			
			
			while(scan.hasNext()) {
				
				for(int i=0; i<10; i++) {
					nums[i] = scan.nextLine();							// 문자열로 받기
					System.out.printf("%s\n", nums[i]);
				}
				System.out.println("문자열로 받기");
				System.out.println();
				
				for(int j = 0; j<10; j++) 	{
					for(int i=0; i<20; i++) {							// 문자열을 문자로 변환
																						
						num[i] = nums[j].charAt(i);				//1차원배열은 1차원배열로 받아야한다.
						
						System.out.printf("%c", num[i]);		// 그리고 배열의 자리수 생각
					
						bitmap[i][j] = num[i]*1;					// 문자를 숫자로 변환하여 역순으로 대입
					}						
					System.out.println();
				}
				System.out.println("문자로 변환한 것 출력");
				
			}
			System.out.println();
			
			//System.out.println(bitmap[0][0]);
			
			for(int k = 0; k<10; k++) {
				for(int i=0; i<20; i++) {
					System.out.printf("%c", bitmap[i][k]);
			
					}
					System.out.println();
				}
			System.out.println("숫자로 변환한 것 출력");
		}
			
		System.out.println();
		
		{																		// 내가 부족한 부분 : 동작 과정을 생각해보기!!
			
			int temp;			
			for(int k = 0; k<10; k++){
				
				for(int j=0; j<20-1; j++) {									// 1. 선언 부분 : 배열 교차,
					  															// 2. 문자열 바꿔주는 방법 : fis.read는 문자열을 int로 반환, toCharArray라는 메서드 사용
					for(int i=0; i<20-1-j; i++) {
						if(bitmap[i+1][k]<bitmap[i][k]) {			// "-1"은 배열이 i와 i+1이라서 이렇게 설계했다. 생각해보기(숫자 대입)
							temp = bitmap[i][k];							// "-j"는 비교되는 값을  한곳으로 몰아 넣고 나머지를 다시 정렬한다.
							bitmap[i][k] =  bitmap[i+1][k];
							bitmap[i+1][k] = temp;
						}
					}
				}
			}
			
			for(int j = 0; j<10; j++) {
			for(int i=0; i<20; i++) {
				System.out.printf("%c", bitmap[i][j]);
		
				}
				System.out.println();
			}
			
			System.out.println("자리변경 완료"); 
		}
		
		
	}

}

```

