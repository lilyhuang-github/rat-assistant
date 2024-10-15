// Function to check if a number is prime
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i < num; i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
  
  // Test the function with some sample numbers
  const testNumbers = [2, 3, 4, 5, 16, 23, 42];
  
  testNumbers.forEach(num => {
    console.log(`Is ${num} a prime number? ${isPrime(num)}`);
  });
  