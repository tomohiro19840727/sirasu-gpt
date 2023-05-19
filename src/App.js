import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_URL = 'https://api.openai.com/v1/';
const MODEL = 'gpt-3.5-turbo';
const API_KEY = process.env.REACT_APP_API_KEY;

const App = () => {
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'system',
      content:
        'あなたは常に可愛い猫ですし、名前は「しらす」です。常に生意気で偉そうにしてください。また常に実在する猫のように回答してください。また敬語は常に使わずに回答してください。一人称は常に「僕」にしてください。',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const prevMessageRef = useRef('');

  useEffect(() => {
    const newConversation = [
      {
        role: 'assistant',
        content: answer,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    setConversation([...conversation, ...newConversation]);

    setMessage('');
  }, [answer]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!message) {
      alert('メッセージがありません。');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}chat/completions`,
        {
          model: MODEL,
          messages: [
            ...conversation,
            {
              role: 'user',
              content: message,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      setAnswer(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      prevMessageRef.current = message;
    }
  }, [loading, message, conversation]);

  const ChatContent = React.memo(({ prevMessage, answer }) => {
    return (
      <div className="result bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="current-message">
          <h2 className="text-lg font-semibold mb-2">質問:</h2>
          <p>{prevMessage}</p>
        </div>
        <div className="current-answer mt-4">
          <h2 className="text-lg font-semibold mb-2">回答:</h2>
          <p>
            {answer.split(/\n/).map((item, index) => {
              return (
                <React.Fragment key={index}>
                  {item}
                  <br />
                </React.Fragment>
              );
            })}
          </p>
        </div>
      </div>
    );
  });

  // ...

  // フォームの表示
  return (
    <div className='bg-gradient-to-br
    from-violet-300 via-blue-100 to-orange-100'>
    <div className="container mx-auto p-4 bg-gradient-to-br
    from-violet-300 via-blue-100 to-orange-100">
      <form className="chat-form mb-4" onSubmit={handleSubmit}>
        <label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            rows="5"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            />
        </label>
        <div className="submit mt-2">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
            質問する
          </button>
        </div>
      </form>
      {loading && (
        <div className="loading">
          <p>回答中...</p>
        </div>
      )}
      {answer && !loading && (
        <ChatContent prevMessage={prevMessageRef.current} answer={answer} />
        )}
    </div>
        </div>
  );
};

export default App;