public class QualityDemo {
    
    // This method is slightly over the 20-line threshold
    // but not long enough to be considered "Critical".
    public void processData() {
        System.out.println("Starting data process...");
        int a = 10;
        int b = 20;
        int sum = a + b;
        System.out.println("Calculating sum...");
        
        if (sum > 0) {
            System.out.println("Positive result");
        } else {
            System.out.println("Non-positive result");
        }

        System.out.println("Iterating values...");
        for (int i = 0; i < 5; i++) {
            System.out.println("Step: " + i);
        }

        System.out.println("Finalizing...");
        System.out.println("Saving to database...");
        System.out.println("Cleaning up resources...");
        System.out.println("Sending notification...");
        System.out.println("Process completed successfully!");
        System.out.println("Done.");
        System.out.println("Exiting method.");
    }

    // Having 6 parameters (limit is 5) will also trigger 
    // a minor "Excess Parameters" issue.
    public void configure(int p1, int p2, int p3, int p4, int p5, int p6) {
        System.out.println("Configuring system with many params...");
    }
}
