export default function(first, second, equalityPredicate) {
	return first.filter(itemFromFirst => !second.find(itemFromSecond => equalityPredicate(itemFromFirst, itemFromSecond)));
}
