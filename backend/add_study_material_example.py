"""
Example script to add new study materials to engineering_study_material table
Use this as a template to populate your database with comprehensive content
"""

from app.core.database import SessionLocal
from app.models import EngineeringStudyMaterial

def add_react_material():
    """Add React study material (IT/CE branch)"""
    db = SessionLocal()
    
    material = EngineeringStudyMaterial(
        topic_name="React Basics",
        branch="IT",
        category="Programming",
        concept_explanation="""React is a JavaScript library for building user interfaces, developed by Facebook. It uses a component-based architecture where UI is broken into reusable pieces. React uses a Virtual DOM for efficient updates and JSX syntax for writing HTML-like code in JavaScript.""",
        practical_application="""React is used in:
• Single Page Applications (SPAs) like Gmail, Facebook
• E-commerce platforms (Shopify, Amazon frontend)
• Mobile apps using React Native
• Dashboard and admin panels
• Real-time applications with WebSockets""",
        code_example="""import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;""",
        step_by_step_guide="""1. Install Node.js from nodejs.org
2. Create app: npx create-react-app my-app
3. Navigate: cd my-app
4. Start dev server: npm start
5. Open browser: http://localhost:3000
6. Edit src/App.js to see changes""",
        difficulty="medium",
        keywords="react,javascript,frontend,ui,components,jsx,hooks,state",
        related_topics="JavaScript,TypeScript,Next.js,Redux,React Router",
        companies_asking="Amazon,Microsoft,Google,Meta,Netflix,Airbnb"
    )
    
    db.add(material)
    db.commit()
    print("✅ Added React Basics material")
    db.close()


def add_mqtt_material():
    """Add MQTT study material (IOT branch)"""
    db = SessionLocal()
    
    material = EngineeringStudyMaterial(
        topic_name="MQTT Protocol",
        branch="IOT",
        category="Theory",
        concept_explanation="""MQTT (Message Queuing Telemetry Transport) is a lightweight publish-subscribe messaging protocol designed for IoT devices with limited bandwidth. It uses a broker-based architecture where devices publish messages to topics and subscribe to receive messages.""",
        practical_application="""MQTT is used in:
• Smart home automation (lights, thermostats, security)
• Industrial IoT (sensor networks, monitoring)
• Connected vehicles (telemetry data)
• Healthcare devices (patient monitoring)
• Agriculture (soil moisture, weather stations)""",
        code_example="""import paho.mqtt.client as mqtt

# Callback when connected
def on_connect(client, userdata, flags, rc):
    print(f"Connected with code {rc}")
    client.subscribe("home/temperature")

# Callback when message received
def on_message(client, userdata, msg):
    print(f"Topic: {msg.topic}")
    print(f"Message: {msg.payload.decode()}")

# Create client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
client.connect("broker.hivemq.com", 1883, 60)

# Publish message
client.publish("home/temperature", "25.5")

# Start loop
client.loop_forever()""",
        step_by_step_guide="""1. Install library: pip install paho-mqtt
2. Choose broker: broker.hivemq.com (public) or mosquitto (local)
3. Create publisher script (sends data)
4. Create subscriber script (receives data)
5. Run subscriber first: python subscriber.py
6. Run publisher: python publisher.py
7. See messages in subscriber terminal""",
        difficulty="medium",
        keywords="mqtt,iot,protocol,messaging,broker,publish,subscribe,sensors",
        related_topics="Arduino MQTT,ESP32 WiFi,IoT Architecture,WebSockets",
        companies_asking="Bosch,Siemens,Honeywell,AWS IoT,Azure IoT"
    )
    
    db.add(material)
    db.commit()
    print("✅ Added MQTT Protocol material")
    db.close()


def add_dsa_material():
    """Add DSA study material (CE/IT branch)"""
    db = SessionLocal()
    
    material = EngineeringStudyMaterial(
        topic_name="Binary Search Algorithm",
        branch="CE",
        category="Programming",
        concept_explanation="""Binary Search is an efficient algorithm for finding an element in a sorted array. It works by repeatedly dividing the search interval in half. Time complexity: O(log n), Space complexity: O(1) for iterative approach.""",
        practical_application="""Binary Search is used in:
• Database indexing and searching
• Finding elements in sorted datasets
• Dictionary lookups
• Version control systems (git bisect)
• Game development (collision detection)""",
        code_example="""def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found at index mid
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
    
    return -1  # Not found

# Test
arr = [1, 3, 5, 7, 9, 11, 13]
target = 7
result = binary_search(arr, target)
print(f"Element found at index: {result}")""",
        step_by_step_guide="""1. Ensure array is sorted (prerequisite)
2. Set left = 0, right = len(arr) - 1
3. Calculate mid = (left + right) // 2
4. Compare arr[mid] with target
5. If equal: return mid (found)
6. If arr[mid] < target: search right half (left = mid + 1)
7. If arr[mid] > target: search left half (right = mid - 1)
8. Repeat until found or left > right""",
        difficulty="medium",
        keywords="binary search,algorithm,dsa,searching,sorted array,divide conquer",
        related_topics="Linear Search,Sorting Algorithms,Two Pointers,Recursion",
        companies_asking="Google,Amazon,Microsoft,Adobe,Goldman Sachs"
    )
    
    db.add(material)
    db.commit()
    print("✅ Added Binary Search Algorithm material")
    db.close()


def add_transistor_material():
    """Add Transistor study material (EC branch)"""
    db = SessionLocal()
    
    material = EngineeringStudyMaterial(
        topic_name="Transistor Basics",
        branch="EC",
        category="Theory",
        concept_explanation="""A transistor is a semiconductor device used to amplify or switch electronic signals. The most common types are BJT (Bipolar Junction Transistor) and MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor). Transistors have three terminals: Base/Gate, Collector/Drain, and Emitter/Source.""",
        practical_application="""Transistors are used in:
• Amplifiers (audio, RF, operational)
• Digital logic gates (AND, OR, NOT)
• Power switching (motor control, LED drivers)
• Voltage regulators
• Oscillators and signal generators""",
        code_example="""Circuit Diagram (NPN Transistor Switch):

        +5V
         |
        [R1] 1kΩ (Load - LED)
         |
    C ---+
         |
    B ---[R2] 10kΩ --- Arduino Pin 9
         |
    E ---+
         |
        GND

Arduino Code:
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(9, HIGH);  // Turn transistor ON
  delay(1000);
  digitalWrite(9, LOW);   // Turn transistor OFF
  delay(1000);
}

Calculation:
I_C = 20mA (LED current)
V_CE(sat) = 0.2V
β (gain) = 100
I_B = I_C / β = 20mA / 100 = 0.2mA
R2 = (5V - 0.7V) / 0.2mA = 21.5kΩ → Use 10kΩ (safe)""",
        step_by_step_guide="""1. Identify transistor type (NPN or PNP)
2. Calculate base current: I_B = I_C / β
3. Select base resistor: R_B = (V_in - 0.7V) / I_B
4. Connect: Base to input (via resistor), Collector to load, Emitter to ground
5. Test with multimeter: V_CE should be ~0.2V when ON
6. Verify load operates correctly""",
        difficulty="medium",
        keywords="transistor,bjt,mosfet,amplifier,switch,electronics,semiconductor",
        related_topics="Diodes,Op-Amps,Digital Logic,Power Electronics",
        companies_asking="Texas Instruments,Intel,Qualcomm,Analog Devices,NXP"
    )
    
    db.add(material)
    db.commit()
    print("✅ Added Transistor Basics material")
    db.close()


if __name__ == "__main__":
    print("🚀 Adding Sample Study Materials\n")
    
    try:
        add_react_material()
        add_mqtt_material()
        add_dsa_material()
        add_transistor_material()
        
        print("\n" + "=" * 60)
        print("✅ ALL MATERIALS ADDED SUCCESSFULLY!")
        print("=" * 60)
        
        # Show summary
        db = SessionLocal()
        count = db.query(EngineeringStudyMaterial).count()
        print(f"\n📚 Total study materials in database: {count}")
        
        materials = db.query(EngineeringStudyMaterial).all()
        print("\n📋 Complete List:")
        for m in materials:
            print(f"   • {m.topic_name} ({m.branch} - {m.category})")
        
        db.close()
        
        print("\n💡 Test in chat:")
        print("   • 'What is Python?'")
        print("   • 'Explain Arduino'")
        print("   • 'What is MQTT?'")
        print("   • 'Explain transistors'")
        print("   • 'What is binary search?'")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
