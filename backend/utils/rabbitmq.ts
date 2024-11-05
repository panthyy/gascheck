import amqplib from "amqplib";

const EXCHANGE = 'gas_exchange';
const RABBITMQ_URL = `amqp://${Bun.env.RABBITMQ_USER}:${Bun.env.RABBITMQ_PASSWORD}@${Bun.env.RABBITMQ_HOST}:${Bun.env.RABBITMQ_PORT}`;

const connection = await amqplib.connect(RABBITMQ_URL);

const gaschannel = await connection.createChannel();
await gaschannel.assertExchange(EXCHANGE, 'topic', { durable: true });

export const rabbitMq = {
    connection,
    gaschannel,
    EXCHANGE
}