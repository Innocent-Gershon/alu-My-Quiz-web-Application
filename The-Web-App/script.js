document.addEventListener('DOMContentLoaded', function () {
  // Get category and difficulty from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const difficulty = urlParams.get('difficulty');

  if (!category || !difficulty) {
    // Handle the case if no query parameters are passed (error in URL)
    alert('Error: Category or Difficulty is missing. Please try again.');
    return; // Prevent further execution
  }

  const quizContainer = document.getElementById('quiz-container');
  const startQuizBtn = document.getElementById('start-quiz-btn'); // Start Quiz button
  const nextBtn = document.getElementById('next-btn');
  const questionNumberElem = document.getElementById('question-number');
  const quizFeedback = document.getElementById('quiz-feedback');
  const progressBar = document.getElementById('progress-bar'); // Progress bar

  let currentQuestionIndex = 0;
  let quizData = [];

  // Function to fetch quiz questions based on the category
  function fetchQuizData() {
    if (category === 'geography') {
      // Geography API
      const apiUrl = `https://geography4.p.rapidapi.com/apis/geography/v1/country?unMember=true&independent=true&status=officially-assigned&landlocked=true&startOfWeek=Monday`;

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          const data = JSON.parse(this.responseText);
          if (data && data.results && data.results.length > 0) {
            quizData = data.results;
            displayQuestion();
          } else {
            console.error('No data returned from Geography API');
            quizContainer.innerHTML = `<p>Sorry, no quiz data found. Please try again later.</p>`;
          }
        }
      });

      xhr.open('GET', apiUrl);
      xhr.setRequestHeader('x-rapidapi-key', 'YOUR_RAPIDAPI_KEY'); // Replace with your actual RapidAPI key
      xhr.setRequestHeader('x-rapidapi-host', 'geography4.p.rapidapi.com');
      xhr.send();
    } else if (category === 'mathematics') {
      // Mathematics API
      const data = JSON.stringify({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: 'How many days in one week?' // Example question, you can modify this as needed
          }
        ]
      });

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          const response = JSON.parse(this.responseText);
          if (response && response.choices && response.choices.length > 0) {
            // Assuming response contains a 'choices' field with the answer
            quizData = [{
              question: 'How many days in one week?', // Use the actual question from the API if dynamic
              correct_answer: '7', // Correct answer for this example
              incorrect_answers: ['6', '8', '5'] // Example incorrect answers
            }];
            displayQuestion();
          } else {
            console.error('No data returned from Mathematics API');
            quizContainer.innerHTML = `<p>Sorry, no quiz data found. Please try again later.</p>`;
          }
        }
      });

      xhr.open('POST', 'https://claude-3-opus-ai.p.rapidapi.com/');
      xhr.setRequestHeader('x-rapidapi-key', 'YOUR_RAPIDAPI_KEY'); // Replace with your actual RapidAPI key
      xhr.setRequestHeader('x-rapidapi-host', 'claude-3-opus-ai.p.rapidapi.com');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(data);
    }
  }

  // Display current question and its answers
  function displayQuestion() {
    if (currentQuestionIndex < quizData.length) {
      const question = quizData[currentQuestionIndex];
      const answers = [];

      if (category === 'geography') {
        // Geography question format: What is the capital of [country]?
        answers.push(question.name); // Country name
        answers.push(question.capital); // Capital
      } else if (category === 'mathematics') {
        // Math question format: Multiple choice for math
        answers.push(question.correct_answer);
        answers.push(...question.incorrect_answers);
      }

      answers.sort(() => Math.random() - 0.5); // Shuffle answers

      quizContainer.innerHTML = `
        <h3>${question.question}</h3>
        <ul id="answer-list">
          ${answers.map(answer => `<li><input type="radio" name="answer" value="${answer}"> ${answer}</li>`).join('')}
        </ul>
      `;

      questionNumberElem.textContent = `Question ${currentQuestionIndex + 1}`;
      updateProgressBar();
    } else {
      quizContainer.innerHTML = `<p>You have completed the quiz! Congratulations!</p>`;
      nextBtn.style.display = 'none';
      quizFeedback.innerHTML = `<p>Your total score is: ${calculateScore()} out of ${quizData.length}</p>`;
    }
  }

  // Update progress bar
  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.innerText = `${Math.round(progress)}%`;
  }

  // Move to next question
  nextBtn.addEventListener('click', () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');

    if (!selectedAnswer) {
      alert('Please select an answer before proceeding.');
      return;
    }

    // Answer validation
    let correctAnswer = '';
    if (category === 'geography') {
      correctAnswer = quizData[currentQuestionIndex].capital;
    } else if (category === 'mathematics') {
      correctAnswer = quizData[currentQuestionIndex].correct_answer;
    }

    if (selectedAnswer.value === correctAnswer) {
      alert('🎉 Correct Answer! Great job!');
    } else {
      alert('❌ Oops! The correct answer was: ' + correctAnswer);
    }

    // Move to the next question
    currentQuestionIndex++;
    displayQuestion();
  });

  // Calculate score
  function calculateScore() {
    return quizData.filter((question, index) => {
      const selectedAnswer = document.querySelector(`input[name="answer"]:checked`);
      let correctAnswer = '';
      if (category === 'geography') {
        correctAnswer = question.capital;
      } else if (category === 'mathematics') {
        correctAnswer = question.correct_answer;
      }
      return selectedAnswer && selectedAnswer.value === correctAnswer;
    }).length;
  }

  // Start Quiz button event listener
  startQuizBtn.addEventListener('click', function () {
    fetchQuizData();
    startQuizBtn.style.display = 'none'; // Hide start button after click
    quizContainer.style.display = 'block'; // Show quiz container
  });

  // Initially hide quiz container, it will be shown after clicking Start Quiz
  quizContainer.style.display = 'none';
});
