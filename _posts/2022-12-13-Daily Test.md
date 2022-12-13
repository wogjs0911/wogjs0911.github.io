---
title: Daily Test
tags: java
---

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

