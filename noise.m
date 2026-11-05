clc;
clear all; 
t=0:1:60;
y=sawtooth(t);
plot(t,y);
hold on;
xlabel('Time (s)');
ylabel('Amplitude');
title('Sawtooth Wave');
grid on;
yNew=awgn(y,10,"measured")
plot(t,yNew);


legend('Original Signal', 'Noisy Signal');
figure;
t=0:0.01:1;
y=sin(2*5*pi*t);
plot(t,y);
hold on;
noise=rand(1,101);
yNoisy = y + noise; 
plot(t, yNoisy);
xlabel('Time (s)');
ylabel('Amplitude');
title('Noisy Sine Wave');
grid on;