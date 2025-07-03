import React from 'react';

/**
 * A minimal component to verify that the React app is rendering.
 * It has no dependencies on routing or authentication hooks.
 */
function App() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold text-foreground mb-2">It's Working!</h1>
      <p className="text-lg text-muted-foreground">
        The basic React application is now rendering correctly.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        We can now proceed to add back the login and dashboard functionality.
      </p>
    </div>
  );
}

export default App;
