import java.net.http.*;
import java.net.URI;
import java.net.http.HttpRequest.BodyPublishers;
import java.nio.file.Path;
import java.nio.file.Files;
import java.time.Duration;
import java.io.IOException;
import java.util.UUID;

public class Connector1 {
    private HttpClient httpClient;
    private String URL;

    public Connector1(String IP) {
        URL = "http://" + IP + ":3000";  // Base URL of your server
        httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)  // Use HTTP/2
            .connectTimeout(Duration.ofSeconds(10))  // Set connection timeout
            .build();
    }

    public HttpRequest createRequest(String data, String filePath, String url) throws IOException {
        Path file = Path.of(filePath);
        String boundary = UUID.randomUUID().toString();
        StringBuilder body = new StringBuilder();

        // Build the multipart/form-data body
        body.append("--").append(boundary).append("\r\n")
            .append("Content-Disposition: form-data; name=\"data\"\r\n\r\n")
            .append(data).append("\r\n")
            .append("--").append(boundary).append("\r\n")
            .append("Content-Disposition: form-data; name=\"file\"; filename=\"")
            .append(file.getFileName()).append("\"\r\n")
            .append("Content-Type: text/plain\r\n\r\n")
            .append(Files.readString(file)).append("\r\n")
            .append("--").append(boundary).append("--");

        // Create the HTTP request
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(BodyPublishers.ofString(body.toString()))
                .build();
    }

    public String register(String name, String orgName, String designation, String email, String mobile, String address, String password, String filePath) {
        String msg = name + "<split>" + orgName + "<split>" + designation + "<split>" + email + "<split>" + mobile + "<split>" + address + "<split>" + password;
        try {
            HttpRequest request = createRequest(msg, filePath, URL + "/register");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();  // Return the response body as a string
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        Connector1 con = new Connector1("127.0.0.1");  // Replace with your server's IP

        // Dummy data
        String name = "Dummy Name";
        String orgName = "Dummy Organization";
        String designation = "Developer";
        String email = "dummy@example.com";
        String mobile = "1234567890";
        String address = "123 Dummy Street";
        String password = "dummyPassword";
        String filePath = "./Connector1.java";  // Ensure this file exists for testing

        try {
            // Pass the dummy data as arguments
            String response = con.register(name, orgName, designation, email, mobile, address, password, filePath);
            System.out.println("Server Response: " + response);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
