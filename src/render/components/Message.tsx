type Props = {
    title: string;
    text: string;
}

const Message = (props: Props) => {
    return (
      <article className="message-content">
        <h1>{props.title}</h1>
        <p>{props.text}</p>
        <a href="/" className="link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                </svg>
                Back to home
            </a>
      </article>
    );
  }

  export default Message