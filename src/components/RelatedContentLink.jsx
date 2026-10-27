import { Link } from 'react-router-dom';

export default function RelatedContentLink({ to, children, ...props }) {
  const isArticle = typeof to === 'string' && to.startsWith('/blog/');
  return <Link to={to} {...props}>
    <span className="mp-related-kind">[ {isArticle ? 'СТАТЬЯ' : 'УСЛУГА'} ]</span>
    {children}
  </Link>;
}
