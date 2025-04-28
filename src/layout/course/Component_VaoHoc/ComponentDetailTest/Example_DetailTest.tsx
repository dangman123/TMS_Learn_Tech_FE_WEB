import React, { useEffect } from "react";
import ContentExampleDetailTest from "./ContentExampleDetailTest";

interface ExampleDetailTestProps {
  testId: number;
  title: string;
}

const Example_DetailTest: React.FC<ExampleDetailTestProps> = ({
  testId,
  title,
}) => {

  return (
    <div className="horizontalMenucontainer">
      <section className="sptb card pt-5">
        <div className="container">
          <div className="row">
            <h2>{title}</h2>
            <ContentExampleDetailTest
              testId={testId}
            
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Example_DetailTest;
