import './App.css';
import ScrollComponent from '@mr-scroll/react';

function App() {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item =>
    <div className="general-item" key={item.toString()}>Item {item}</div>
  );

  return (
    <div className="App">
      <div className="general-example">
        <ScrollComponent>
          {items}
        </ScrollComponent>
      </div>

      <div className="general-example">
        <ScrollComponent mode="overlay">
          {items}
        </ScrollComponent>
      </div>
    </div>
  );
}

export default App;
