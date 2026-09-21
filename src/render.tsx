import { renderToString } from 'react-dom/server';
import Markdown from 'react-markdown';


const Message = ({ title, text }: { title: string; text: string }) => {
    return (
      <article className="content">
        <h1>{title}</h1>
        <p>{text}</p>
      </article>
    );
  }
  
  export const renderNotFound = (): string => {
    return renderToString(
      <Message title="Page not found" text="The page you're looking for doesn't exist." />,
    );
  }
  
  export const renderServerError = (): string => {
    return renderToString(
      <Message title="Something went wrong" text="Please try again in a moment." />,
    );
  }

const Page = ({ markdown }: { markdown: string }) => {
  return (
    <article className="content">
      <Markdown>{markdown}</Markdown>
    </article>
  );
}

export const renderPage = (markdown: string): string => {
  return renderToString(<Page markdown={markdown} />);
}