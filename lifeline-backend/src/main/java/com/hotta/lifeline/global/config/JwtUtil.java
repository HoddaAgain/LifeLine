package com.hotta.lifeline.global.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessTokenExp;
    private final long refreshTokenExp;

    // yml 파일에서 값을 가져와서 초기화
    public JwtUtil(
            @Value("${jwt.secret-key}") String secretKey,
            @Value("${jwt.access-token-expiration}") long accessTokenExp,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExp) {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExp = accessTokenExp;
        this.refreshTokenExp = refreshTokenExp;
    }

    // Access Token 생성
    public String createAccessToken(String loginId, String mode) {
        return createToken(loginId, mode, accessTokenExp);
    }

    // Refresh Token 생성
    public String createRefreshToken(String loginId, String mode) {
        return createToken(loginId, mode, refreshTokenExp);
    }

    // 실제 토큰을 찍어내는 내부 로직
    private String createToken(String loginId, String mode, long expireTime) {
        Claims claims = Jwts.claims().setSubject(loginId); // 토큰의 주인(아이디)
        claims.put("mode", mode); // 이지/노말 모드 정보

        Date now = new Date();
        Date validity = new Date(now.getTime() + expireTime);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘 적용
                .compact();
    }

    // 1. 토큰에서 유저 아이디 꺼내기
    public String getLoginIdFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 2. 토큰이 유효한지 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}