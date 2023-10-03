import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../userContext";
import { io } from "socket.io-client";
import { AUTH_HEADER, SERVER_BASE_URL } from "../constants";
const Questions = () => {
  const [question, setQuestion] = useState("");
  const [editedQuestion, setEditedQuestion] = useState("");
  const [allQuestion, setAllQuestion] = useState([]);
  const { username } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [editableQuestionId, setEditableQuestionId] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${SERVER_BASE_URL}/admin/question`,
        {
          question: question,
        },
        {
          headers: AUTH_HEADER,
        }
      );
      // getQuestions();
      socket.emit("addingQuestion");
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
    setQuestion("");
    console.log("hi");
  };
  const getQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/questions");
      console.log(res?.data?.response);
      setAllQuestion(res?.data?.response);
    } catch (e) {
      console.log(e?.message);
    }
  };
  useEffect(() => {
    getQuestions();
    setSocket(io(SERVER_BASE_URL));
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("questionVoted", () => {
        getQuestions();
      });

      socket.on("questionDeleted", () => {
        getQuestions();
      });

      socket.on("questionAdded", () => {
        getQuestions();
      });

      socket.on("questionEdited", () => {
        getQuestions();
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const handleLike = (questionId) => {
    socket.emit("upvote", questionId, username);
  };

  const handleDelete = (questionId) => {
    socket.emit("deleteQuestion", questionId);
  };

  const handleEdit = (questionId, prevQuestion) => {
    setEditableQuestionId(questionId);
    setEditedQuestion(prevQuestion);
    // if(prevQuestion!==editedQuestion)
    console.log(questionId, prevQuestion);

    // socket.emit("editQuestion", questionId, editedQuestion);
  };
  const submitEditiedQuestion = async () => {
    try {
      const res = await axios.put(
        `${SERVER_BASE_URL}/admin/question/${editableQuestionId}`,
        {
          question: editedQuestion,
        },
        {
          headers: AUTH_HEADER,
        }
      );
      socket.emit("editingQuestion");
      setEditableQuestionId(null);
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
    setEditedQuestion("");
  };
  // const handleLike = async (questionId) => {
  //   try {
  //     const res = await axios.put(
  //       `http://localhost:3000/vote/question/${questionId}`,
  //       {
  //         username: username,
  //         vote: true,
  //       },{
  //         headers: {
  //           Authorization: "Bearer " + localStorage.getItem("token"),
  //         },
  //       }
  //     );
  //     console.log(res);
  //     if(res.data.msg == 'Already voted'){
  //       alert('Already Voted')
  //       return;
  //     }
  //     getQuestions();
  //   } catch (err) {
  //     console.log(err?.message);
  //   }
  // };
  return (
    <div>
      {/* show list of questions  */}
      <div>
        <h2>All questions:</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              style={{
                borderRadius: "8px",
                margin: "5px auto",
                padding: "5px",
                paddingLeft: "20px",
                width: "90vw",
                fontSize: "18px",
                minHeight: "40px",
              }}
            />
          </div>
        </form>
        <div style={{ marginTop: "20px" }}>
          {allQuestion.map((q) => {
            return (
              <div key={q?._id} style={{ marginTop: "10px" }}>
                <div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "5px",
                      minHeight: "100px",
                    }}
                  >
                    {!(editableQuestionId == q?._id) ? (
                      <div>{q?.question}</div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitEditiedQuestion();
                        }}
                      >
                        <div
                          style={{ display: "flex", justifyItems: "center" }}
                        >
                          <input
                            value={editedQuestion}
                            onChange={(e) => setEditedQuestion(e.target.value)}
                            placeholder="Enter your question"
                            style={{
                              borderRadius: "8px",
                              // margin: "5px auto",
                              padding: "5px",
                              paddingLeft: "20px",
                              width: "90vw",
                              fontSize: "18px",
                              minHeight: "40px",
                            }}
                          />
                          <div>
                            <button
                              style={{ paddingTop: "4px" }}
                              onClick={submitEditiedQuestion}
                            >
                              ✔️
                            </button>
                            <button onClick={() => setEditableQuestionId(null)}>
                              ❌
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <div>
                        <button
                          onClick={() => handleLike(q?._id)}
                          style={{
                            cursor: "pointer",
                            padding: "4px",
                            width: "50px",
                          }}
                        >
                          Like
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDelete(q?._id)}
                          style={{
                            cursor: "pointer",
                            padding: "4px",
                            width: "50px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleEdit(q?._id, q?.question)}
                          style={{
                            cursor: "pointer",
                            padding: "4px",
                            width: "50px",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ marginTop: "4px" }}>{q?.votes} Likes</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Questions;
