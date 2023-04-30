varying vec3 vColor;

void main()
{
    // light point

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength += pow(strength, 10.0);

    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}