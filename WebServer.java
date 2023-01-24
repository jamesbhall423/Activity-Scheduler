import java.io.* ;
import java.net.* ;
import java.util.* ;
public final class WebServer
{
  public static void main(String argv[]) throws Exception
  {
    // sets the port number to be used (default: 6789; optional: argv[0])
    int port = argv.length > 0 ? Integer.parseInt(argv[0]) : 6789;
    // Establish the listen socket.
    ServerSocket welcomeSocket = new ServerSocket(port);
    // Process HTTP service requests in an infinite loop.
    while (true) {
      // Listen for a TCP connection request.
      Socket connectionSocket = welcomeSocket.accept();
      // Construct an object to process the HTTP request message.
      HttpRequest request = new HttpRequest(connectionSocket);
      // Create a new thread to process the request.
      Thread thread = new Thread(request);
      // Start the thread.
      thread.start(); 
    } 
  }
} 