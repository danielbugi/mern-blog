import { formatISO9075 } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { BiEdit } from 'react-icons/bi';

const PostPage = () => {
  const { userInfo } = useContext(UserContext);
  const [postInfo, setPostInfo] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:3000/post/${id}`).then((res) => {
      res.json().then((postInfo) => {
        setPostInfo(postInfo.post);
      });
    });
  }, []);

  if (!postInfo) return <h2>No post were found 404</h2>;

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username}</div>
      {userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            Edit this post <BiEdit />
          </Link>
        </div>
      )}
      <div className="image">
        <img src={`http://localhost:3000/${postInfo.cover}`} alt="" />
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />
    </div>
  );
};
export default PostPage;
