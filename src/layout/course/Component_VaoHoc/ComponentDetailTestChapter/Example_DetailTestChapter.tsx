import React, { useEffect } from "react";
import ContentExampleDetailTestChapter from "./ContentExampleDetailTestChapter";

interface ExampleDetailTestProps {
  testId: number;
  title: string;
}

const Example_DetailTestChapter: React.FC<ExampleDetailTestProps> = ({
  testId,
  title,
}) => {
  return (
    <div className="horizontalMenucontainer">
      <section className="sptb card pt-5">
        <div className="container">
          <div className="row">
            <h2>{title}</h2>
            <ContentExampleDetailTestChapter testId={testId} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Example_DetailTestChapter;
