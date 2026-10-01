# Stage 1: Build JAR using official Maven image
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal, secure JRE runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create upload directory for images
RUN mkdir -p uploads/images

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
