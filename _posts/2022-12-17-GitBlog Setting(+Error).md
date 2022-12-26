---
key: /2022/12/17/GitBlog-Setting(+Error).html
title: GitBlog-GitBlog 설정(에러 해결)
tags: TeXt, gitblog

---

# 1. gitalk 에러 해결


### 1) gitalk 기본 설정 : 

- 먼저, [GitHub OAuth App](https://github.com/settings/applications/new)에서  gitblog를 등록해야 한다.
- [참고 블로그: 6mini.github.io](https://6mini.github.io/github%20blog/2021/08/29/blog/)
- GitHub OAuth App에서 gitblog를 등록할 때, Authorization callback URL은 댓글이 저장될 임의의 포스팅된 블로그 게시글의 URL이다.(제일 중요!!!! 여기서 에러 많이 발생한다.) 
<br><br>

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

- _config.yml 파일에서 gitalk 설정의 repository부분은 깃허브 id를 빼고 댓글을 저장할 임의의 repository 이름이다.(추가로 만든 repository이다!!)
- 나는 블로그 repo말고도 외부 repo에서 댓글을 관리하고 싶어서 추가로 "gitalk"라는 repo를 만들어 주었다.

<br><br>
### 2) gitalk 기본 설정하고 나서  블로그 포스팅시, 댓글을 적용 시키려면  post할  md 파일에 key: jekyll-text-theme 항상 설정 추가하기


```
---
key: jekyll-text-theme
title: gitblog 설정시, error 해결
tags: TeXt
---
```

<br><br>
### 3) gitalk 기본 설정하고 나서  블로그 포스팅시, 댓글을 적용 시키려면  주의할 사항!!

- 댓글을 적용 시키려면  post할  md 파일에 key: jekyll-text-theme 항상 설정 추가.
- _posts의 .md 파일명은 항상 영어로 만들어야 한다.(gitalk 사용을 위해서 .md 파일명은 50자 이하로 되어야하는데 한글은 깨지기 때문에 영어로 파일명을 작성한다.)
- 블로그를 직접 포스팅할 때, title 항목에는 영어나 한글을 아무거나 사용해도 상관없다.
- https://github.com/wogjs0911/gitalktest 에서 Issues 탭에서 포스팅한 글 목록 하나당 label(gitalk, url) 붙여줘서 댓글이랑 연동시켜주기  

<br><br>
### 4) gitalk를 이용하기 위해서는 Authorize(인증) 필요

- key: jekyll-text-theme가 설정된 아무 게시글이나 들어가면 되는데 , Login with GitHub를 클릭하고나서 Authorize(인증)을 가볍게 해주면 gitalk를 통해 댓글을 사용할 수 있다.

<br><br>
### 5) 하지만, gitalk를 사용하면 댓글이 중복되는 문제가 있다.(추가로 해결하기)

- post할  .md 파일에서 key 설정은 댓글을 모아두는 repository에 labels별로 나뉘어지므로 각각 다르게 설정해주어야 한다.
- 보통 각 페이지 url의 뒷부분을 넣음. ex) /2022/12/17/GitBlog-Setting(+Error).html

```
---
key: /2022/12/17/GitBlog-Setting(+Error).html
title: gitblog 설정시, error 해결
tags: TeXt
---
```

<br><br>
---


<br><br>
# 2. gitblog의 방문자 수 확인하는 방법


### 1) [Google Analytics](https://analytics.google.com/analytics/web/?hl=ko#/) 이용해야 한다. 

- [블로그 참고 1 : 파인데이터랩 GA4 초기 세팅 사항 참고](https://finedata.tistory.com/50?category=1052408)
- [블로그 참고 1 : 파인데이터랩 GA4 설치 방법 참고](https://finedata.tistory.com/52?category=913224)


<br><br>
---


<br><br>
# 3. gitblog의 카테고리 추가하는 방법







