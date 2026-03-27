-- Create engineering_study_material table for comprehensive multi-domain study content
-- Supports CE, IT, ICT, EC, IOT branches with structured learning materials

CREATE TABLE IF NOT EXISTS engineering_study_material (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,  -- 'CE', 'IT', 'ICT', 'EC', 'IOT', 'ALL'
    category VARCHAR(100) NOT NULL,  -- 'Programming', 'Theory', 'Hardware', 'Project'
    concept_explanation TEXT NOT NULL,
    practical_application TEXT,
    code_example TEXT,
    step_by_step_guide TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',  -- 'easy', 'medium', 'hard'
    keywords VARCHAR(500),  -- Comma-separated: "python,programming,loops,functions"
    related_topics VARCHAR(500),  -- Comma-separated related topic names
    companies_asking VARCHAR(500),  -- Companies that ask about this topic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_study_material_topic ON engineering_study_material(topic_name);
CREATE INDEX IF NOT EXISTS idx_study_material_branch ON engineering_study_material(branch);
CREATE INDEX IF NOT EXISTS idx_study_material_category ON engineering_study_material(category);

-- Insert sample data for testing (Python - IT/CE branch)
INSERT INTO engineering_study_material (
    topic_name, 
    branch, 
    category, 
    concept_explanation, 
    practical_application, 
    code_example, 
    step_by_step_guide, 
    difficulty, 
    keywords, 
    related_topics, 
    companies_asking
) VALUES (
    'Python Basics',
    'IT',
    'Programming',
    'Python is a high-level, interpreted programming language known for its simplicity and readability. It uses indentation for code blocks and supports multiple programming paradigms including procedural, object-oriented, and functional programming.',
    'Python is widely used in web development (Django, Flask), data science (Pandas, NumPy), machine learning (TensorFlow, PyTorch), automation scripts, and backend APIs. Companies use Python for rapid prototyping and production systems.',
    'print("Hello World")\n\n# Variables and data types\nname = "Student"\nage = 20\nis_enrolled = True\n\n# Lists and loops\nnumbers = [1, 2, 3, 4, 5]\nfor num in numbers:\n    print(f"Number: {num}")',
    '1. Install Python from python.org\n2. Create a file: touch hello.py\n3. Write code: print("Hello World")\n4. Run: python hello.py\n5. Expected output: Hello World',
    'easy',
    'python,programming,basics,syntax,variables,loops,functions',
    'Python Functions,Python OOP,Python Data Structures',
    'TCS,Infosys,Wipro,Cognizant,Accenture'
);

-- Insert sample data for Arduino (IOT/EC branch)
INSERT INTO engineering_study_material (
    topic_name, 
    branch, 
    category, 
    concept_explanation, 
    practical_application, 
    code_example, 
    step_by_step_guide, 
    difficulty, 
    keywords, 
    related_topics, 
    companies_asking
) VALUES (
    'Arduino Programming',
    'IOT',
    'Hardware',
    'Arduino is an open-source electronics platform based on easy-to-use hardware and software. It uses a simplified version of C++ and provides a simple IDE for programming microcontrollers. Arduino boards can read inputs (sensors, buttons) and control outputs (LEDs, motors).',
    'Arduino is used in IoT projects, home automation, robotics, sensor networks, and prototyping. Common applications include temperature monitoring, smart lighting, automated irrigation, and industrial automation systems.',
    '// Blink LED example\nvoid setup() {\n  pinMode(13, OUTPUT);  // Set pin 13 as output\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);  // Turn LED on\n  delay(1000);             // Wait 1 second\n  digitalWrite(13, LOW);   // Turn LED off\n  delay(1000);             // Wait 1 second\n}',
    '1. Install Arduino IDE from arduino.cc\n2. Connect Arduino board via USB\n3. Select board: Tools > Board > Arduino Uno\n4. Select port: Tools > Port > COM3 (or /dev/ttyUSB0)\n5. Write code in IDE\n6. Click Upload button\n7. LED on pin 13 will blink',
    'easy',
    'arduino,iot,microcontroller,embedded,sensors,programming',
    'Raspberry Pi,ESP32,Sensor Integration,MQTT Protocol',
    'Bosch,Siemens,Honeywell,IoT Startups'
);

-- Insert sample data for Circuit Analysis (EC branch)
INSERT INTO engineering_study_material (
    topic_name, 
    branch, 
    category, 
    concept_explanation, 
    practical_application, 
    code_example, 
    step_by_step_guide, 
    difficulty, 
    keywords, 
    related_topics, 
    companies_asking
) VALUES (
    'Ohms Law',
    'EC',
    'Theory',
    'Ohms Law states that the current through a conductor between two points is directly proportional to the voltage across the two points. Formula: V = I × R, where V is voltage (volts), I is current (amperes), and R is resistance (ohms).',
    'Ohms Law is fundamental in circuit design, power calculations, LED resistor selection, voltage dividers, and troubleshooting electrical circuits. Used in PCB design, power supply design, and analog circuit analysis.',
    'Circuit Diagram:\n\n  +V (9V)\n   |\n  [R] 470Ω\n   |\n  [LED]\n   |\n  GND\n\nCalculation:\nV = 9V (supply)\nV_LED = 2V (LED drop)\nV_R = 9V - 2V = 7V\nI = 20mA (LED current)\nR = V_R / I = 7V / 0.02A = 350Ω\nUse standard 470Ω resistor',
    '1. Identify circuit components (voltage source, resistors, load)\n2. Measure or note voltage (V) across component\n3. Measure or calculate current (I) through component\n4. Apply formula: R = V / I\n5. Verify with multimeter if building physical circuit',
    'easy',
    'ohms law,circuit,voltage,current,resistance,electronics',
    'Kirchhoffs Laws,Series Circuits,Parallel Circuits,Power Calculations',
    'Texas Instruments,Analog Devices,Intel,Qualcomm'
);

COMMENT ON TABLE engineering_study_material IS 'Comprehensive study materials for all engineering branches with structured content for AI-powered learning';
