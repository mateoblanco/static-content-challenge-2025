import Markdown from 'react-markdown';


type Props = {
    markdown: string;
}

const Page = (props: Props) => {
    return (
        <article className="content">
            <Markdown>{props.markdown}</Markdown>
        </article>
    );
}

export default Page