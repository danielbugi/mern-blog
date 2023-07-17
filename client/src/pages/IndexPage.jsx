import { useEffect, useState } from 'react';
import Post from '../components/Post';

const IndexPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/post').then((res) => {
      res.json().then((posts) => {
        setPosts(posts.data);
      });
    });
  }, []);
  return (
    <>
      {posts.length > 0 &&
        posts.map((post) => {
          return <Post {...post} key={post._id} />;
        })}
    </>
  );
};
export default IndexPage;
