import React, { useState } from "react";
import TestDetailPopup from "./TestDetailPopup";
interface Test {
  testId: string;
  description: string;
  title: string;
  duration: number;
  totalQuestions: number;
 
}

interface ContentExampleProps {
  tests: Test[];
}
function ContentExample({ tests }: ContentExampleProps) {

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsPopupOpen(true); 
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false); // Close the popup
  };
  return (
    <div className="col-md-12" style={{ background: "rgb(255, 255, 255)", height: "auto !important", minHeight: "0px !important", }}>
      <div style={{ height: "auto !important" }}>
        <div
          className="card-body"
          style={{
            height: "auto !important",
            minHeight: "0px !important",
          }}

        >
          <div className="row" style={{ gap:"5px" }}>
            {tests.length === 0 ? (
              <p>Không có khóa học</p>
            ) : (
              tests.map((test) => (
                <div className="col-md-2" key={test.testId} style={{ height: "auto !important", minHeight: "0px !important" }}>
                  <div className="item">
                    <div className="col-md-4 col-sm-4">
                      <a href="#" onClick={() => handleTestClick(test)}>
                        <img src="../../assets/images/example/example.png" alt={test.title} />
                      </a>
                    </div>
                    <div className="col-md-8 col-sm-8">
                      <div className="content">
                        <div className="title">
                          <a href="#" onClick={() => handleTestClick(test)}>
                            {test.title}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedTest && (
            <TestDetailPopup
              open={isPopupOpen}
              onClose={handleClosePopup}
              testDetails={selectedTest}
            />
          )}
        </div>
      </div>
    </div>
  );
}
export default ContentExample;
