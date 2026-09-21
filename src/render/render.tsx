import { renderToString } from 'react-dom/server';
import Page from './components/Page.js';
import Message from './components/Message.js';


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



export const renderPage = (markdown: string): string => {
  return renderToString(<Page markdown={markdown} />);
}