import './App.css';
import Scroll from '@mr-scroll/react';

function App() {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item =>
    <div className="general-item" key={item.toString()}>Item {item}</div>
  );

  return (
    <div className="App">
      <div className="general-example">
        <Scroll>
          {items}
        </Scroll>
      </div>

      <div className="general-example">
        <Scroll mode="overlay">
          {items}
        </Scroll>
      </div>
    </div>
  );
}

export default App;
