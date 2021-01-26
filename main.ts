/*
Copyright (C): 2010-2019, Shenzhen Yahboom Tech
modified from liusen
load dependency
"GHBit": "file:../pxt-ghbit"
*/

//% color="#C814B8" weight=20 icon="\uf11b"
namespace GHBit {

    const PCA9685_ADD = 0x41;
    const MODE1 = 0x00;
    const MODE2 = 0x01;
    const SUBADR1 = 0x02;
    const SUBADR2 = 0x03;
    const SUBADR3 = 0x04;

    const LED0_ON_L = 0x06;
    const LED0_ON_H = 0x07;
    const LED0_OFF_L = 0x08;
    const LED0_OFF_H = 0x09;

    const ALL_LED_ON_L = 0xFA;
    const ALL_LED_ON_H = 0xFB;
    const ALL_LED_OFF_L = 0xFC;
    const ALL_LED_OFF_H = 0xFD;

    const PRESCALE = 0xFE;

    let initialized = false;
    let yahStrip: neopixel.Strip;
    
    export enum STepper {
        //% blockId="Stepper" block="foreward"
        Stepper = 0,
        //% blockId="Stepper0" block="reversal"
        Stepper0,
        //% blockId="Stepper1" block="Stop"
        Stepper1
    }
    export enum Angle {
        //% blockId="Angle0" block="first gear"
        Angle0 = 0,
        //% blockId="Angle1" block="second gear"
        Angle1,
        //% blockId="Angle2" block="third gear"
        Angle2,
        //% blockId="Angle3" block="forth gear"
        Angle3,
        //% blockId="Angle4" block="fifth gear"
        Angle4,
        //% blockId="Angle5" block="sixth gear"
        Angle5,
        //% blockId="Angle6" block="seventh gear"
        Angle6,
        //% blockId="Angle7" block="eighth gear"
        Angle7
    }
    export enum Beamstate {
     	//% blockId="bright" block="Bright"
     	bright = 1,
     	//% blockId="dark" block="Dark"
     	dark
    }
    export enum enMusic {

        dadadum = 0,
        entertainer,
        prelude,
        ode,
        nyan,
        ringtone,
        funk,
        blues,

        birthday,
        wedding,
        funereal,
        punchline,
        baddy,
        chase,
        ba_ding,
        wawawawaa,
        jump_up,
        jump_down,
        power_up,
        power_down
    }
    
    export enum enServo {
        
        S1 = 1,
        S2,
        S3,
        S4
    }
    
    export enum Motorshock {
        //% blockId="OFF" block="OFF"
        OFF = 0,
        //% blockId="ON" block="ON"
        ON
    }
    
    export enum speed {
        //% blockId="speed1" block="1"
        speed1 = 2000,
        //% blockId="speed2" block="2"
        speed2 = 3000,
        //% blockId="speed3" block="3"
        speed3 = 4000
    }
    
    export enum enRocker {
        //% blockId="Nostate" block="Nostate"
        Nostate = 0,
        //% blockId="Up" block="Up"
        Up,
        //% blockId="Down" block="Down"
        Down,
        //% blockId="Left" block="Left"
        Left,
        //% blockId="Right" block="Right"
        Right,
        //% blockId="Press" block="Press"
        Press
    }
    
    export enum enButtonState {
        //% blockId="Press" block="Press"
        Press = 0,
        //% blockId="Realse" block="Realse"
        Realse = 1
    }
    
    export enum enButton {
        
        B1 = 0,
        B2,
        B3,
        B4
    }
    
    export enum enColor {
        //% blockId="OFF" block="OFF"
        OFF = 0,
        //% blockId="RED" block="RED"
        RED,
        //% blockId="GREEN" block="GREEN"
        GREEN,
        //% blockId="BLUE" block="BLUE"
        BLUE,
        //% blockId="WHITE" block="WHITE"
        WHITE,
        //% blockId="CYAN" block="CYAN"
        CYAN,
        //% blockId="PINKISH" block="PINKISH"
        PINKISH,
        //% blockId="YELLOW" block="YELLOW"
        YELLOW
    }
    
    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1);
        buf[0] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00);
        setFreq(50);
        initialized = true;
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

    /**
     * *****************************************************************
     * @param index
     */
    
    //% blockId=GHBit_RGB_Program block="RGB_Program"
    //% weight=99
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Program(): neopixel.Strip {
         
        if (!yahStrip) {
            yahStrip = neopixel.create(DigitalPin.P4, 4, NeoPixelMode.RGB);
        }
        return yahStrip;  
    }  
       
    //% blockId=GHBit_RGB_Program_Close block="RGB_Program_Close"
    //% weight=98
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function RGB_Program_Close(): void {
        pins.digitalWritePin(DigitalPin.P4, 0);
        GHBit.RGB_Program().clear();
        GHBit.RGB_Program().show();
    }
    
    //% blockId=GHBit_Min_Motor_Shake block="Min_Motor_Shake|value %value"
    //% weight=97
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Min_Motor_Shake(value: Motorshock): void {
        switch (value) {
            case Motorshock.ON: {
              setPwm(0, 0, 4095);
              break;
            }
            case Motorshock.OFF: {
              setPwm(0, 0, 0);
              break;
            }
        }               
    }
    
    //% blockId=GHBit_Rocker block="Rocker|value %value"
    //% weight=96
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=6
    export function Rocker(value: enRocker): boolean {

        pins.setPull(DigitalPin.P8, PinPullMode.PullUp);
        let x = pins.analogReadPin(AnalogPin.P1);
        let y = pins.analogReadPin(AnalogPin.P2);
        let z = pins.digitalReadPin(DigitalPin.P8);
        let now_state = enRocker.Nostate;

        if (x < 200) // 上
        {

            now_state = enRocker.Up;

        }
        else if (x > 730) //下 900 -> 730
        {

            now_state = enRocker.Down;
        }
        else  // 左右
        {
            if (y < 200) //右
            {
                now_state = enRocker.Right;
            }
            else if (y > 730) //左 900 -> 730
            {
                now_state = enRocker.Left;
            }
        }
        if (z == 0)
            now_state = enRocker.Press;
        if (now_state == value)
            return true;
        else
            return false;

    }
    
    //% blockId=GHBit_Button block="Button|num %num|value %value"
    //% weight=95
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=5
    export function Button(num: enButton, value: enButtonState): boolean {
         let temp = false;
         switch (num) {
            case enButton.B1: {
              pins.setPull(DigitalPin.P13, PinPullMode.PullUp);
              if (pins.digitalReadPin(DigitalPin.P13) == value) {
                temp = true;
              }
              else {
                temp = false;
              }
              break;
            }
            case enButton.B2: {
              pins.setPull(DigitalPin.P14, PinPullMode.PullUp);
              if (pins.digitalReadPin(DigitalPin.P14) == value) {
                temp = true;
              }
              else {
                temp = false;
              }
              break;
            }
            case enButton.B3: {
              pins.setPull(DigitalPin.P15, PinPullMode.PullUp);
              if (pins.digitalReadPin(DigitalPin.P15) == value) {
                temp = true;
              }
              else {
                temp = false;
              }
              break;
            }
            case enButton.B4: {
              pins.setPull(DigitalPin.P16, PinPullMode.PullUp);
              if (pins.digitalReadPin(DigitalPin.P16) == value) {
                temp = true;
              }
              else {
                temp = false;
              }
              break;
            }
        }
        return temp;         
    }
    

    
    //% blockId=GHBit_Music_Handle block="Music_Handle|%index"
    //% weight=92
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Music_Handle(index: enMusic): void {
        switch (index) {
            case enMusic.dadadum: music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once); break;
            case enMusic.birthday: music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once); break;
            case enMusic.entertainer: music.beginMelody(music.builtInMelody(Melodies.Entertainer), MelodyOptions.Once); break;
            case enMusic.prelude: music.beginMelody(music.builtInMelody(Melodies.Prelude), MelodyOptions.Once); break;
            case enMusic.ode: music.beginMelody(music.builtInMelody(Melodies.Ode), MelodyOptions.Once); break;
            case enMusic.nyan: music.beginMelody(music.builtInMelody(Melodies.Nyan), MelodyOptions.Once); break;
            case enMusic.ringtone: music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once); break;
            case enMusic.funk: music.beginMelody(music.builtInMelody(Melodies.Funk), MelodyOptions.Once); break;
            case enMusic.blues: music.beginMelody(music.builtInMelody(Melodies.Blues), MelodyOptions.Once); break;
            case enMusic.wedding: music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once); break;
            case enMusic.funereal: music.beginMelody(music.builtInMelody(Melodies.Funeral), MelodyOptions.Once); break;
            case enMusic.punchline: music.beginMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.Once); break;
            case enMusic.baddy: music.beginMelody(music.builtInMelody(Melodies.Baddy), MelodyOptions.Once); break;
            case enMusic.chase: music.beginMelody(music.builtInMelody(Melodies.Chase), MelodyOptions.Once); break;
            case enMusic.ba_ding: music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once); break;
            case enMusic.wawawawaa: music.beginMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once); break;
            case enMusic.jump_up: music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once); break;
            case enMusic.jump_down: music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once); break;
            case enMusic.power_up: music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once); break;
            case enMusic.power_down: music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once); break;
        }
    }
    
    //% blockId=GHBit_Servo_Handle block="Servo_Handle|num %num|value %value"
    //% weight=91
    //% blockGap=10
    //% color="#C814B8"
    //% num.min=1 num.max=4 value.min=0 value.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=9
    export function Servo_Handle(num: enServo, value: number): void {

        // 50hz: 20,000 us
        let us = (value * 1800 / 180 + 600); // 0.6 ~ 2.4
        let pwm = us * 4096 / 20000;
        setPwm(num + 8, 0, pwm);

    }
        
    //% blockId=GHBit_Ultrasonic_Handle block="ultrasonic return distance(cm)"
    //% color="#C814B8"
    //% weight=90
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic_Handle(): number {

      // send pulse
      pins.setPull(DigitalPin.P12, PinPullMode.PullNone)
      pins.digitalWritePin(DigitalPin.P12, 0)
      control.waitMicros(4)
      pins.digitalWritePin(DigitalPin.P12, 1)
      control.waitMicros(15)
      pins.digitalWritePin(DigitalPin.P12, 0)
      const d = pins.pulseIn(DigitalPin.P11, PulseValue.High, 500 * 40);
      return Math.idiv(d, 40)
    }

    //% blockId=GHBit_Ultrasonic_Handle_V2 block="ultrasonic_V2 return distance(cm)"
    //% color="#C814B8"
    //% weight=90
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic_Handle_V2(): number {

      // send pulse
      pins.setPull(DigitalPin.P12, PinPullMode.PullNone)
      pins.digitalWritePin(DigitalPin.P12, 0)
      control.waitMicros(4)
      pins.digitalWritePin(DigitalPin.P12, 1)
      control.waitMicros(15)
      pins.digitalWritePin(DigitalPin.P12, 0)
      const d = pins.pulseIn(DigitalPin.P11, PulseValue.High, 500 * 58);
      return Math.idiv(d, 58)
    }

    //% blockId=GHBit_RGB_Colorful block="RGB_Colorful|%value"
    //% weight=89
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Colorful(value: enColor): void {
        switch (value) {
            case enColor.OFF: {
              setPwm(15, 0, 0);
              setPwm(14, 0, 0);
              setPwm(13, 0, 0);
              break;
            }
            case enColor.RED: {
              setPwm(15, 0, 4095);
              setPwm(14, 0, 0);
              setPwm(13, 0, 0);
              break;
            }
            case enColor.GREEN: {
              setPwm(15, 0, 0);
              setPwm(14, 0, 4095);
              setPwm(13, 0, 0);
              break;
            }
            case enColor.BLUE: {
              setPwm(15, 0, 0);
              setPwm(14, 0, 0);
              setPwm(13, 0, 4095);
              break;
            }
            case enColor.WHITE: {
              setPwm(15, 0, 4095);
              setPwm(14, 0, 4095);
              setPwm(13, 0, 4095);
              break;
            }
            case enColor.CYAN: {
              setPwm(15, 0, 0);
              setPwm(14, 0, 4095);
              setPwm(13, 0, 4095);
              break;
            }
            case enColor.PINKISH: {
              setPwm(15, 0, 4095);
              setPwm(14, 0, 0);
              setPwm(13, 0, 4095);
              break;
            }
            case enColor.YELLOW: {
              setPwm(15, 0, 4095);
              setPwm(14, 0, 4095);
              setPwm(13, 0, 0);
              break;
            }
        }
    }
    
    //% blockId=GHBit_Stepper_Motor block="Stepper_Motor|value %value|value1 %value1"
    //% weight=88
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Stepper_Motor(value: STepper, value1: speed): void {
    	  let a = 64;  
        switch (value) {
            case STepper.Stepper: { 
            	while( a )    
            	{     	             
                setPwm(1, 0, 4095);
                setPwm(2, 0, 4095);
                setPwm(3, 0, 0);
                setPwm(4, 0, 0);
                control.waitMicros(value1);                       
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                setPwm(3, 0, 4095);
                setPwm(4, 0, 0);
                control.waitMicros(value1);                         
                setPwm(1, 0, 0);
                setPwm(2, 0, 0);
                setPwm(3, 0, 4095);
                setPwm(4, 0, 4095);
                control.waitMicros(value1);              
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                setPwm(3, 0, 0);
                setPwm(4, 0, 4095);
                control.waitMicros(value1); 
                a--;
              }  
                a = 0;
              break;
            }
            case STepper.Stepper0: {
            	while( a )
            	{ 
                setPwm(1, 0, 0);
                setPwm(2, 0, 0);
                setPwm(3, 0, 4095);
                setPwm(4, 0, 4095);
                control.waitMicros(value1);                       
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                setPwm(3, 0, 4095);
                setPwm(4, 0, 0);
                control.waitMicros(value1);                         
                setPwm(1, 0, 4095);
                setPwm(2, 0, 4095);
                setPwm(3, 0, 0);
                setPwm(4, 0, 0);
                control.waitMicros(value1);              
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                setPwm(3, 0, 0);
                setPwm(4, 0, 4095);
                control.waitMicros(value1);  
                 a--;
              }
                a = 0;
              break;
            }
            case STepper.Stepper1: {
              setPwm(1, 0, 0);
              setPwm(2, 0, 0);
              setPwm(3, 0, 0);
              setPwm(4, 0, 0);
              break;
            }               
        } 
    }  
    //% blockId=GHBit_Min_Motor block="Min_Motor|value %value"
    //% weight=87
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Min_Motor(value: Angle): void {
        switch (value) {
            case Angle.Angle0: {
              setPwm(7, 0, 0);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle1: {
              setPwm(7, 0, 600);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle2: {
              setPwm(7, 0, 1200);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle3: {
              setPwm(7, 0, 1800);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle4: {
              setPwm(7, 0, 2400);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle5: {
              setPwm(7, 0, 3000);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle6: {
              setPwm(7, 0, 3600);
              setPwm(8, 0, 0);
              break;
            }
            case Angle.Angle7: {
              setPwm(7, 0, 4095);
              setPwm(8, 0, 0);
              break;
            }
        }               
    }   
    //% blockId=GHBit_Rotate block="Rotate|value %value"
    //% weight=86
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=6
    export function Rotate(value: Angle): boolean {

        let y = pins.analogReadPin(AnalogPin.P3);
        let a = false;
        switch (value) {
        	case Angle.Angle0: {
        		if(y < 128)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle1: {
        		if(y < 254 && y > 127)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle2: {
        		if(y < 381 && y > 253)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle3: {
        		if(y < 508 && y > 381)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle4: {
        		if(y < 635 && y > 508)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle5: {
        		if(y < 762 && y > 634)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle6: {
        		if(y < 889 && y > 761)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
          case Angle.Angle7: {
        		if( y > 888)
        	  	a = true;
        		else 
        			a = false;
        		 break;
          }
        }
        return a;
    }
    
    //% blockId=GHBit_Beam block="Beam|value %value"
    //% weight=85
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=6
    export function Beam(value: Beamstate): boolean {

        pins.setPull(DigitalPin.P10, PinPullMode.PullUp);
        let x = pins.analogReadPin(AnalogPin.P10);
        if (x < 700) // 亮
        {
            if(value==Beamstate.bright){
            	return true;
            	}
            else{
            	
            	return false;
                }
        }
        else{
        
        	 if(value==Beamstate.dark){
            	return true;
            	}
            else{
            	return false;
            }
        }
    }
    
    
}
