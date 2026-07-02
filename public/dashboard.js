const form = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const resultPanel = document.getElementById('resultPanel');
const resultList = document.getElementById('resultList');
const resultSummary = document.querySelector('.result-summary');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  resultSummary.textContent = 'Analyzing your prompt...';
  resultList.innerHTML = '';

  const prompt = promptInput.value.trim();

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();

    if (!data.success) {
      resultSummary.textContent = data.error || 'Unable to analyze prompt.';
      return;
    }

    resultSummary.textContent = data.summary;
    resultList.innerHTML = data.analysis.map((item) => `<li>${item}</li>`).join('');
  } catch (error) {
    resultSummary.textContent = 'Unable to connect to the analyzer. Please refresh and try again.';
    resultList.innerHTML = '';
  }
});
