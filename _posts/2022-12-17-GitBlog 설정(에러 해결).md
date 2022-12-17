---
key: jekyll-text-theme
title: GitBlog 설정(에러 해결)
tags: TeXt
---

# 1. gitalk 에러 해결


### 1) gitalk 기본 설정 : 

- 먼저, [GitHub OAuth App](https://github.com/settings/applications/new)에서  gitblog를 등록해야 한다.
- [참고 블로그: 6mini.github.io](https://6mini.github.io/github%20blog/2021/08/29/blog/)

```
 gitalk:
    clientID    : GitHub OAuth App 설정하고 난 후 나오는 clientID!! # GitHub Application Client ID
    clientSecret: GitHub OAuth App 설정하고 난 후 나오는 clientSecret!! # GitHub Application Client Secret
    repository  : 깃허브 id 빼고 댓글을 저장할 임의의 repository 이름!!(추가로 만든 repository이다.)# GitHub repo
    owner       : 깃허브 id!! # GitHub repo owner
    admin: 
    - 깃허브 id (여기선, "-"가 중요하다!!) # GitHub repo owner and collaborators, only these guys can initialize GitHub issues, IT IS A LIST.
      # - your GitHub Id
```


### 2) gitalk 기본 설정하고 나서  블로그 포스팅시, 댓글을 적용 시키려면  post할  md 파일에 key: jekyll-text-theme 항상 설정 추가하기


```
---
key: jekyll-text-theme
title: gitblog 설정시, error 해결
tags: TeXt
---
```

---


# 2. gitblog의 방문자 수 확인하는 방법


### 1) [Google Analytics](https://analytics.google.com/analytics/web/?hl=ko#/) 이용해야 한다. 

- [블로그 참고 1 : 파인데이터랩 GA4 초기 세팅 사항 참고](https://finedata.tistory.com/50?category=1052408)
- [블로그 참고 1 : 파인데이터랩 GA4 설치 방법 참고](https://finedata.tistory.com/52?category=913224)



# 3. gitblog의 카테고리 추가하는 방법



