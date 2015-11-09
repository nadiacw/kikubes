#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include "Adafruit_TCS34725.h"
SoftwareSerial BT(10,11); // Bluetooth 10 RX, 11 TX.
char values[255];
int i = 0;

//LED strip is connected to digital pin 3
#define LED_PIN 3

// Color sensor
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_700MS, TCS34725_GAIN_1X);
// 6 leds on the strip
Adafruit_NeoPixel strip = Adafruit_NeoPixel(6, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  
  // BT setup
  Serial.begin(9600);
  BT.begin(9600);
  
  // LEDs setup
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
}

void loop(){
  // get values from RGB sensor
  uint16_t red, green, blue, clear, colorTemp, lux;
  tcs.getRawData(&red, &green, &blue, &clear);
  uint32_t sum = red;
  sum += green;
  sum += blue;
  sum = clear;
  float r, g, b;
  r = red; r /= sum;
  g = green; g /= sum; 
  b = blue; b /= sum;
  r *= 256; g *= 256; b *= 256;
  if (r > 255) r = 255;
  if (g > 255) g = 255;
  if (b > 255) b = 255;
  
  // r, g, b are the final color values, with values from 0 to 255
  
  // Send color sensor data to Protocoder
  // seperated by a space
  BT.print((String)r + " ");
  BT.print((String)g + " ");
  BT.print((String)b);
  BT.println();
  
  // Get Bluetooth messages from Protocoder and turn on lights
  if(BT.available()){
    
    char value = BT.read();
    
    values[i++] = value;
    
    if(value == '\n')
    {
      Serial.print(values);
      
      if(strstr(values, "low")!=0)
      {
      strip.setBrightness(10);
      }
      
      // example colors:
      if(strstr(values, "red")!=0)
      {
        colorWipe(strip.Color(255, 0, 0), 50);
      }
      if(strstr(values, "green")!=0)
      {
        colorWipe(strip.Color(0, 255, 0), 50);
      }
      if(strstr(values, "blue")!=0)
      {
        colorWipe(strip.Color(0, 0, 255), 50);
      }
      if(strstr(values, "pink")!=0)
      {
        colorWipe(strip.Color(120, 0, 120), 50);
      }
      if(strstr(values, "off")!=0)
      {
        colorWipe(strip.Color(0, 0, 0), 50);
      }
      BT.write("\r");
      clean();
    }
  }
  if (Serial.available())
    BT.write(Serial.read());
}

void clean()
{
  for (int cl=0; cl<=i; cl++)
  {
    values[cl]=0;
  }
  i=0;
}

// Adafruit Neopixel function:
// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, c);
      strip.show();
      delay(wait);
  }
}

