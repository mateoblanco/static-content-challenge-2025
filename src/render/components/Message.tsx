type Props = {
    title: string;
    text: string;
}

const Message = (props: Props) => {
    return (
      <article className="content">
        <h1>{props.title}</h1>
        <p>{props.text}</p>
      </article>
    );
  }

  export default Message