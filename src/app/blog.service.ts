import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class BlogService {
  private posts: Post[]= []; //memory cache of all blog posts

  constructor(private route: ActivatedRoute, private router: Router) {
    this.fetchPosts();
  }

  fetchPosts(): void {
    /* DONE:
      This method "populates" the posts property by retrieving 
      all all blog posts from localStorage. This function must be 
      called inside the constructor so that all posts are retrieved 
      and be ready in memory when BlogService is created. 
    */

    var cookie = document.cookie;
    console.log("cookie", cookie);

    var p: Post[] = [];
    var customXMLHttpRequest = (function (jwtoken) {
        function getXMLHttpRequest(method, url, async){
            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open(method, url, async);
            // xmlHttpRequest.withCredentials = true;
            // xmlHttpRequest.setRequestHeader('Authorization', 'Bearer ' + jwtoken);
            // xmlHttpRequest.setRequestHeader('Access-Control-Allow-Origin', 'http://lvh.me:3000');
            xmlHttpRequest.onerror = function onError(e){
              console.log("Error", e);
            }
            xmlHttpRequest.onreadystatechange = function() {
              
                if (xmlHttpRequest.readyState == XMLHttpRequest.DONE) {
                    // alert(xmlHttpRequest.responseText);
                    var arr = JSON.parse(this.responseText);
                    for(var i =0; i < arr.length; i++){
                      // let currentPost = JSON.parse(arr.getItem(arr.key(i)));
                      let currentPost = arr[i];
                      // console.log("fetch posts current post from local storage: ", currentPost);
                      p.push(currentPost);
                    }
                
                    console.log("this.posts after: ", p);
                }
            }
            return xmlHttpRequest;
        }
        return getXMLHttpRequest;
    })(cookie);

    var xmlHttpRequest = customXMLHttpRequest('get','http://lvh.me:3000/api/cs144',true);
    xmlHttpRequest.send();

    //TODO: assign this.posts somehow during the xhr callback
    this.posts = p;

    console.log("this.posts after Fetch Post: ", this.posts);
  }

  getPosts(): Post[] {
    /* DONE: This method simply returns posts */
    return this.posts;
  }

  getPost(id: number): Post{
    /* DONE: Find the post with postid=id from posts and return it */
    // let retrievedPost: Post = JSON.parse(localStorage.getItem(id.toString()));
    var found = null;
    for (var i = 0; i < (this.posts).length; i++){
      var element = this.posts[i];

      if (element.postid == id) {
        found = element;
      }
    }

    console.log("get post:" + found);

    // returns null if post is not found
    return found; 
  }

  newPost(): Post {
    /* DONE
    Create a new post with a new postid, an empty title
    and body, and current creation and modification times,
    save it to localStorage, add it to posts, and return it.
    The postid of a new post should start at 1 and increase
    linearly.
    */
    let currentDate = new Date();
    let newPost:Post = new Post;

    // Find existing max postid
    let maxID = Math.max.apply(Math,this.posts.map(function(item){return item.postid;}));

    // For Clear Storage case 
    if (maxID < 0) {
      maxID = 0;
    }
    console.log("maxid", maxID);

    // create new post

    newPost.postid = maxID + 1;
    newPost.created = currentDate;
    newPost.modified = currentDate;
    newPost.title='default title';
    newPost.body='default body';

    // save to localStorage
    // console.log("saving to local storage: ", newPost.postid.toString());
    // localStorage.setItem(newPost.postid.toString(), JSON.stringify(newPost));
    
    // Add to posts
    console.log("push post: ", this.posts.push(newPost));

    console.log("Just created new post: ", newPost, " current id is now:  ", maxID + 1);

    const FETCH_URL = 'http://lvh.me:3000/api/cs144/' + newPost.postid;
    var myOptions = {
      method: 'POST',
      body: JSON.stringify({"titles": "default title", "body": "default body"}),
      dataType: 'json',
      headers: {
        // 'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    };

   (function (postid, posts, router) {
      fetch(FETCH_URL, myOptions)
        .then(res => {
          res.json()
          console.log("response: " + res.status);
          if(res.status == 400){
            console.log("deleted post");
            alert("Error creating post at the server");
            let removeIndex = posts.map(function(item) { return (item.postid).toString(); }).indexOf(postid.toString());
            posts.splice(removeIndex, 1);
            router.navigate(['/']);
          }
        })
        .catch(error => console.error('Error:', error))
        .then(response => {
          console.log('Success: ', response);
        });
    })(newPost.postid, this.posts, this.router);
    
    return newPost; 
  }

  updatePost(post: Post): void {
    /* DONE
    From posts, find a post whose postid is the same as 
    post.postid, update its title and body with the passed-in
    values, change its modification time to now, and update
    the post in localStorage. If no such post exists, do nothing.
    */
    let currentTime = new Date();
    let retrievedPost = JSON.parse(localStorage.getItem(post.postid.toString()));
    retrievedPost.title = post.title;
    retrievedPost.body = post.body;
    retrievedPost.modified = currentTime;
    
    // update post in localStorage
    localStorage.setItem(retrievedPost.postid.toString(), JSON.stringify(retrievedPost));

    // update post in local array
    let localPost = this.posts.find(x => x.postid === post.postid);
    localPost.title = post.title;
    localPost.body = post.body;
    localPost.modified = post.modified;
  }

  deletePost(postid: number): void {
    /* DONE
    From posts, find a post whose postid is the same as
    post.postid, delete it from posts, and delete a 
    corresponding post from localStorage. If no such post
    exists, do nothing.
    */
   /*
    From posts, find a post whose postid is the same as the passed in value, 
    delete it from posts, and send a DELETE request to /api/:username/:postid 
    (after setting up the response event handler). If no such post exists, do nothing.

    The response event handler should do nothing if the response status code is "204 (No content)".
    Otherwise, it should display an alert message saying that there was an error 
    deleting the post at the server, and navigate to /, the "list pane" of the editor.
   */

    console.log("GONNA DELETE THIS POST: " + this.getPost(postid));
    if (! this.getPost(postid)) {
      return;
    }

    const FETCH_URL = 'http://lvh.me:3000/api/cs144/' + postid;
    var myOptions = {
      method: 'DELETE',
      headers: {
        // 'Authorization': 'Bearer ' + accessToken,
        
      }
    };

    fetch(FETCH_URL, myOptions)
      .then(function(res) {
        if (res.status != 204) {
          alert("Error: There was an error deleting the post at the server!");
          // TODO: Reroute to list?
        }
      })
      .catch(error => console.error('Error:', error))
      .then(response => {
        console.log('Success: ', response);
      });

      let removeIndex = this.posts.map(function(item) { return (item.postid).toString(); }).indexOf(postid.toString());
      this.posts.splice(removeIndex, 1);
  }

}

export class Post {
  postid: number;
  created: Date;
  modified: Date;
  title: string;
  body: string;
}
