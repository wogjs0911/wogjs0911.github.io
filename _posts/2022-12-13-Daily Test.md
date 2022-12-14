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

